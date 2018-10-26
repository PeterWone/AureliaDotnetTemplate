const glyphContext = require.context(
    ".",
    true,
    /^\.\/.*\.(jpe?g|png|gif|svg)$/i
);

export class GlyphContextValueConverter {
    toView(name: string) {
        // find first partial match
        let key = glyphContext.keys().find(k => k.includes(name)) || "";
        // resolve to context
        return glyphContext(key);
    }
}

