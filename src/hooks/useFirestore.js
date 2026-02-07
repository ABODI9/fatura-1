import { useEffect, useState } from "react";

export const useFirestore = (subscribeFn, deps = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub = null;

    (async () => {
      try {
        setLoading(true);
        unsub = subscribeFn((rows) => {
          setData(rows || []);
          setLoading(false);
        });
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    })();

    return () => {
      if (typeof unsub === "function") unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading };
};
