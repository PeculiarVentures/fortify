/**
 * Print formatted data
 *
 * Example:
 * printf("Some text %1 must be %2", 1, "here")
 * @param text string template
 * @param args arguments
 */
export const printf = (text: string, ...args: any[]) => {
  let msg: string = text;
  let match: RegExpExecArray | null;
  const regFind = /(%\d+)/g;
  const matches: Array<{ arg: string, index: number }> = [];

  // eslint-disable-next-line no-cond-assign
  while (match = regFind.exec(msg)) {
    matches.push({ arg: match[1], index: match.index });
  }

  // replace matches
  for (let i = matches.length - 1; i >= 0; i -= 1) {
    const item = matches[i];
    const arg = item.arg.substring(1);
    const { index } = item;

    msg = msg.substring(0, index) + args[i] + msg.substring(index + 1 + arg.length);
  }

  // convert %% -> %
  // msg = msg.replace("%%", "%");

  return msg;
};
