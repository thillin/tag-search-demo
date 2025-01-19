import { useState, useMemo, useEffect, useCallback, useRef } from "react";

import { HttpLog } from "./types";
import { createPortal } from "react-dom";

interface FuzzySearchProps {
	data: HttpLog[];
	onChange: (data: HttpLog[]) => void;
}

const getSuggestions = (
	data: HttpLog[],
	tagKey: keyof HttpLog,
	inputValue: string
) => {
	const suggestions = new Set(
		data
			.map((i) => i[tagKey])
			.filter((s) =>
				s.toString().toLowerCase().includes(inputValue.toLowerCase())
			)
			.map((s) => s.toString())
	);
	return Array.from(suggestions);
};

export function FuzzySearch({ data, onChange }: FuzzySearchProps) {
	const [inputValue, setInputValue] = useState<string>("");
	// Tags to display and filter by
	const [tags, setTags] = useState<Map<string, string | null>>(new Map());
	// If a tag key has been set but no value - used to get appropriate suggestions
	const incompleteTag = useMemo(() => {
		const [key] =
			Array.from(tags.entries()).find(([, value]) => value === null) ??
			[];
		return key as keyof HttpLog | null;
	}, [tags]);
	// Toggle suggestions dropdown display
	const [showSuggestions, setShowSuggestions] = useState(false);
	// Ref for input - used to focus on input when a suggestion is selected using the mouse
	const inputRef = useRef<HTMLInputElement>(null);

	// Index of highlighted suggestion in suggestions array
	const [highlightedSuggestion, setHighlightedSuggestion] =
		useState<number>(0);

	// All data keys - would probably come from the server in a real app
	const dataKeys = useMemo(() => Object.keys(data[0]), [data]);

	// Get all keys that start with the input value and aren't already in the tags map
	const getMatchingKeys = useCallback(
		(input: string) => {
			return dataKeys.filter((k) => {
				return k.startsWith(input) && !tags.has(k);
			});
		},
		[dataKeys, tags]
	);

	// Get all suggestions based on the current input value and tags
	const suggestions = useMemo(() => {
		if (!incompleteTag) {
			const pathSuggestions = !tags.has("path")
				? getSuggestions(data, "path", inputValue)
				: [];
			if (pathSuggestions.length > 0) {
				return pathSuggestions;
			}
			const matchingKeys = getMatchingKeys(inputValue);
			return matchingKeys;
		} else {
			const suggestions = getSuggestions(data, incompleteTag, inputValue);
			return suggestions;
		}
		return [];
	}, [incompleteTag, inputValue, data, tags, getMatchingKeys]);

	// Update the highlighted suggestion index when the suggestions array changes
	useEffect(() => {
		if (highlightedSuggestion >= suggestions.length) {
			setHighlightedSuggestion(suggestions.length - 1);
		}
	}, [suggestions, highlightedSuggestion]);

	// Manage the input value and toggle suggestions dropdown
	const onTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const input = e.target.value;
		setInputValue(input);
		if (!showSuggestions) {
			setShowSuggestions(true);
		}
	};

	// Function to filter the table
	useEffect(() => {
		const results = data.filter((item) => {
			// Check tag filters
			for (const [key, value] of tags.entries()) {
				if (!value) continue;
				if (
					item[key as keyof HttpLog].toString() !== value.toString()
				) {
					return false;
				}
			}

			const isSelectingTag = dataKeys.some(
				(key) => key.startsWith(inputValue) && !tags.has(key)
			);

			return inputValue.length > 0 && !isSelectingTag
				? item.path.includes(inputValue)
				: true;
		});
		onChange(results);
	}, [data, inputValue, tags, onChange, dataKeys]);

	// Change the highlighted suggestion index - used for keyboard navigation
	const changeHighlightedSuggestion = (direction: "up" | "down") => {
		setHighlightedSuggestion((prev) => {
			if (direction === "up") {
				return prev > 0 ? prev - 1 : prev;
			}
			return prev < suggestions.length - 1 ? prev + 1 : prev;
		});
	};

	// Handle enter key - toggle suggestions dropdown and select a suggestion
	const handleEnter = () => {
		if (!showSuggestions) {
			setShowSuggestions(true);
			return;
		}
		selectSuggestion();
	};

	// Select a suggestion - used for both mouse and keyboard
	const selectSuggestion = (suggestion?: string) => {
		const selectedSuggestion =
			suggestion || suggestions[highlightedSuggestion]?.toString();
		const isTag = getMatchingKeys(selectedSuggestion).length > 0;
		if (selectedSuggestion) {
			if (incompleteTag) {
				setTag(incompleteTag, selectedSuggestion);
			} else if (isTag) {
				setTag(selectedSuggestion as keyof HttpLog, null);
			} else {
				setTag("path", selectedSuggestion);
			}
			setInputValue("");
			setHighlightedSuggestion(0);
		}
	};

	// Set a tag
	const setTag = (tagKey: keyof HttpLog, tagValue: string | null) => {
		setTags((prevTags) => {
			const newTags = new Map(prevTags);
			newTags.set(tagKey, tagValue);
			return newTags;
		});
	};

	// Remove either the key or value of the last tag depending on state
	const removeLastTagSection = () => {
		if (!incompleteTag) {
			const lastTag = Array.from(tags.entries()).pop();
			if (lastTag) {
				setTag(lastTag[0] as keyof HttpLog, null);
			}
		} else {
			setTags((prevTags) => {
				const newTags = new Map(prevTags);
				newTags.delete(incompleteTag);
				return newTags;
			});
		}
	};

	// Handle keyboard actions
	const keyActions = {
		ArrowDown: () => changeHighlightedSuggestion("down"),
		ArrowUp: () => changeHighlightedSuggestion("up"),
		Enter: handleEnter,
		Escape: () => setShowSuggestions(false),
		Backspace: removeLastTagSection,
	} as const;

	const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		const key = e.key as keyof typeof keyActions;
		if (key in keyActions) {
			if (key === "Backspace" && inputValue.length > 0) {
				return;
			}
			e.preventDefault();
			keyActions[key]();
		}
	};

	const suggestionsVisible = showSuggestions && suggestions.length > 0;

	return (
		<div className="bg-white border-dashed w-full border-gray-300 rounded-lg px-2 relative z-10 flex flex-row gap-2 items-center h-14">
			{tags.size > 0 && (
				<>
					{Array.from(tags.entries()).map(
						([key, value]) =>
							value && (
								<div
									key={key}
									className="bg-blue-500 p-2 rounded-lg cursor-pointer hover:bg-blue-600"
									onClick={() =>
										setTags((prevTags) => {
											const newTags = new Map(prevTags);
											newTags.delete(key);
											return newTags;
										})
									}
								>
									{key}: {value}
								</div>
							)
					)}
				</>
			)}
			<div
				className={`${
					incompleteTag
						? "bg-blue-500 p-2 my-2 rounded-lg cursor-pointer hover:bg-blue-600"
						: "ml-2 flex-1"
				}`}
			>
				{!!incompleteTag && `${incompleteTag}: `}
				<input
					type="text"
					onChange={onTextInputChange}
					className={`${
						incompleteTag ? "text-white" : "text-black w-full py-4"
					} h-full focus:outline-none bg-transparent`}
					value={inputValue}
					onKeyDown={onKeyDown}
					ref={inputRef}
				/>
			</div>
			{suggestionsVisible && (
				<div className="flex flex-col gap-2 absolute top-16 left-0 w-full bg-zinc-900 border border-gray-300 rounded-md p-2 z-10">
					{suggestions.map((suggestion, index) => (
						<div
							key={suggestion}
							onClick={() => {
								selectSuggestion(suggestion);
								inputRef.current?.focus();
							}}
							onMouseEnter={() => setHighlightedSuggestion(index)}
							className={`${
								index === highlightedSuggestion && "bg-blue-500"
							} cursor-pointer rounded-md`}
						>
							{suggestion}
						</div>
					))}
				</div>
			)}
			{createPortal(
				suggestionsVisible && (
					<div
						className="absolute h-screen w-screen z-5 top-0 left-0 bg-zinc-900/50"
						onClick={() => setShowSuggestions(false)}
					/>
				),
				document.getElementById("root") as HTMLElement
			)}
		</div>
	);
}
