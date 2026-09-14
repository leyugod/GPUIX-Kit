/** 命令是应用传入的动作；UIKit 不访问系统，也不自动注册全局快捷键。 */
export interface Command {
  id: string;
  label: string;
  group?: string;
  keywords?: readonly string[];
  shortcut?: string;
  disabled?: boolean;
  checked?: boolean;
  destructive?: boolean;
  run: () => void;
}
export function filterCommands(commands: readonly Command[], query: string) {
  const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return commands.filter((c) =>
    words.every((word) =>
      [c.label, c.group, ...(c.keywords ?? [])]
        .join(" ")
        .toLocaleLowerCase()
        .includes(word),
    ),
  );
}
export function createCommandRegistry(commands: readonly Command[]) {
  const map = new Map<string, Command>();
  for (const command of commands) {
    if (map.has(command.id))
      throw new Error(`Duplicate command id: ${command.id}`);
    map.set(command.id, command);
  }
  return {
    commands: [...map.values()] as readonly Command[],
    execute(id: string) {
      const command = map.get(id);
      if (!command || command.disabled) return false;
      command.run();
      return true;
    },
    search(query: string) {
      return filterCommands([...map.values()], query);
    },
  };
}
