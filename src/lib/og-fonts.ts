async function loadFont(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load font: ${url}`);
  }
  return response.arrayBuffer();
}

const GREAT_VIBES_URL =
  "https://fonts.gstatic.com/s/greatvibes/v21/RWmMoKWR9v4ksMfaWd_JN-XC.ttf";

export async function loadGreatVibes() {
  return loadFont(GREAT_VIBES_URL);
}

export async function loadOgFonts() {
  const [greatVibes, cormorantLight, cormorantItalic] = await Promise.all([
    loadGreatVibes(),
    loadFont(
      "https://fonts.gstatic.com/s/cormorantgaramond/v21/co3umX5slCNuHLi8bLeY9MK7whWMhyjypVO7abI26QOD_qE6GnM.ttf",
    ),
    loadFont(
      "https://fonts.gstatic.com/s/cormorantgaramond/v21/co3smX5slCNuHLi8bLeY9MK7whWMhyjYrGFEsdtdc62E6zd5rDDOjw.ttf",
    ),
  ]);

  return {
    greatVibes,
    cormorantLight,
    cormorantItalic,
  };
}
