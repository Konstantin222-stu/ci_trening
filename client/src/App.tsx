import { useState } from 'react';

interface DemoTask {
  id: number;
  title: string;
  done: boolean;
}

export function App() {
  const [title, setTitle] = useState('');
  const [tasks, setTasks] = useState<DemoTask[]>([
    { id: 1, title: 'Проверить клиентский CI', done: false },
  ]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    setTasks((prev) => [
      ...prev,
      { id: Date.now(), title: trimmed, done: false },
    ]);
    setTitle('');
  };

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item,
      ),
    );
  };

  return (
    <main style={{ maxWidth: 480, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>CI Sandbox — Tasks</h1>
      <form onSubmit={handleAdd}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Новая задача проекта"
        />
        <button type="submit">Добавить</button>
      </form>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <label>
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => toggleTask(task.id)}
              />
              {task.title}
            </label>
          </li>
        ))}
      </ul>
    </main>
  );
}

export default App;