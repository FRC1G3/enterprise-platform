function encodeVariantPart(
  value: string | null,
): string {
  if (value === null) {
    return "n";
  }

  return `s${Buffer.byteLength(value, "utf8")}:${value}`;
}

export function createCartVariantKey(
  selectedColor: string | null,
  selectedSize: string | null,
): string {
  return [
    encodeVariantPart(selectedColor),
    encodeVariantPart(selectedSize),
  ].join("|");
}
