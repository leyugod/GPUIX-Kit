import qrcode from "qrcode-generator";
export function utf8Bytes(value: string): number[] {
  const bytes: number[] = [];
  for (const char of value) {
    let n = char.codePointAt(0)!;
    if (n >= 0xd800 && n <= 0xdfff) n = 0xfffd;
    if (n < 0x80) bytes.push(n);
    else if (n < 0x800) bytes.push(0xc0 | (n >> 6), 0x80 | (n & 63));
    else if (n < 0x10000)
      bytes.push(0xe0 | (n >> 12), 0x80 | ((n >> 6) & 63), 0x80 | (n & 63));
    else
      bytes.push(
        0xf0 | (n >> 18),
        0x80 | ((n >> 12) & 63),
        0x80 | ((n >> 6) & 63),
        0x80 | (n & 63),
      );
  }
  return bytes;
}
export function qrMatrix(
  value: string,
  level: "L" | "M" | "Q" | "H" = "M",
): boolean[][] {
  if (!value || utf8Bytes(value).length > 1500)
    throw Error("QR text must contain 1–1500 UTF-8 bytes");
  if (!["L", "M", "Q", "H"].includes(level))
    throw Error("Invalid correction level");
  const qr = qrcode(0, level),
    previous = qrcode.stringToBytes;
  // 编码过程同步完成并恢复依赖配置，不把应用全局编码永久改成 UTF-8。
  try {
    qrcode.stringToBytes = (s) => utf8Bytes(s);
    qr.addData(value, "Byte");
    qr.make();
  } finally {
    qrcode.stringToBytes = previous;
  }
  const n = qr.getModuleCount();
  return Array.from({ length: n }, (_, y) =>
    Array.from({ length: n }, (_, x) => qr.isDark(y, x)),
  );
}
export function qrSvg(matrix: readonly (readonly boolean[])[]) {
  const n = matrix.length + 8;
  const cells = matrix
    .flatMap((row, y) =>
      row.flatMap((dark, x) =>
        dark ? ["M" + (x + 4) + " " + (y + 4) + "h1v1h-1z"] : [],
      ),
    )
    .join("");
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" width="' +
    n +
    '" height="' +
    n +
    '" viewBox="0 0 ' +
    n +
    " " +
    n +
    '"><path d="' +
    cells +
    '" fill="#000"/></svg>'
  );
}
