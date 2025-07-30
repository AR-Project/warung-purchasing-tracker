import Fuse from "fuse.js";
import { useState } from "react";

type Default = { id: string; name: string };

/**
 * Hooks for managing a list.
 * @param url API Endpoint location where new list can be fetch using `refreshList` method
 * @param initalValue initial list to make searchable
 * @returns Object contains: `list`, `search` method, `refreshlist` method, and `filteredList`
 */
export default function useList<T = Default>(url: string, initalValue: T[]) {
  const [list, setList] = useState<T[]>(initalValue);
  const [filteredList, setFilteredList] = useState<T[]>(initalValue);

  let fuse = _initFuse();

  function _initFuse() {
    return new Fuse(list, {
      includeScore: true,
      keys: ["name"],
    });
  }

  function search(keyword: string) {
    if (keyword.length === 0) {
      setFilteredList(list);
    } else {
      const result = fuse.search(keyword);
      setFilteredList(result.map(({ item }) => item));
    }
  }

  function refreshList() {
    fetch(url)
      .then((res) => res.json())
      .then((list) => {
        setList(list);
        _initFuse();
      });
  }

  return { list, filteredList, refreshList, search };
}
