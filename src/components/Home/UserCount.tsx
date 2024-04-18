import { useEffect, useState } from "react";
import { loadUsers } from "../../utils";

const updateInterval = 30_000;

const getUserCountMessage = (count: number | undefined) => {
  if (count === 0)
    return <strong>Belum ada yang mendaftar nih. Jadilah yang pertama!</strong>;
  else if (count && count > 0)
    return (
      <div>
        <strong>IndoNostr People: {count}</strong> 🎉
      </div>
    );
  else return <strong>Tunggu bentar ya…</strong>;
};

export const UserCount = () => {
  const [userCount, setUserCount] = useState<undefined | number>();

  const updateUserCount = (users: Record<string, string>) => {
    const userCount = Object.keys(users).length;
    setUserCount(userCount);
  };

  useEffect(() => {
    loadUsers().then(updateUserCount);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      loadUsers().then(updateUserCount);
    }, updateInterval);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <section className="box user-count">
      {getUserCountMessage(userCount)}
    </section>
  );
};
