async function View({ fileName = "obsidian_lottie.json", folderPath }) {
  const isLottie = fileName.toLowerCase().endsWith(".json");
  const [mediaSrc, setMediaSrc] = dc.useState(null);
  const [loadScript, setLoadScript] = dc.useState(null);

  // Load the loadScript function dynamically
  dc.useEffect(() => {
    dc.require(folderPath + "/src/utils/loadScript.js")
      .then(({ loadScript }) => {
        setLoadScript(() => loadScript);
      })
      .catch(err => {
        console.error("Failed to load loadScript utility:", err);
      });
  }, [folderPath]);

  // Load lottie-player script dynamically if needed (now with caching!)
  dc.useEffect(() => {
    if (isLottie && loadScript && !window.customElements.get("lottie-player")) {
      loadScript(
        dc,
        "https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"
      ).catch(err => {
        console.error("Failed to load lottie-player:", err);
      });
    }
  }, [isLottie, loadScript]);

  // Load media file via fuzzy search
  dc.useEffect(() => {
    if (!loadScript) return;

    // Fuzzy search for a file using Fuse.js and the Obsidian file index
    async function fuzzyFindFile(filename) {
      // Ensure Fuse is loaded (now with caching!)
      if (!window.Fuse) {
        await loadScript(dc, "https://cdn.jsdelivr.net/npm/fuse.js/dist/fuse.js");
      }

      const files = app.vault.getFiles();
      const fuse = new Fuse(files, {
        keys: ["name"],
        includeScore: true,
        threshold: 0.4,
      });

      const results = fuse.search(filename);
      return results.length > 0 ? results[0].item : null;
    }

    // Get Obsidian resource path by fuzzy filename match
    async function requireMediaFile(filename) {
      const file = await fuzzyFindFile(filename);
      if (!file) {
        throw new Error(`File "${filename}" not found`);
      }
      return app.vault.getResourcePath(file);
    }

    requireMediaFile(fileName)
      .then((url) => {
        // Small delay to avoid layout thrash
        setTimeout(() => setMediaSrc(url), 0);
      })
      .catch((err) => {
        console.error("Error loading media file:", err);
      });
  }, [fileName, loadScript]);

  return (
    <div style={{ 
      width: "100%", 
      height: "100%", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      backgroundColor: "transparent",
      overflow: "hidden",
    }}>
      {mediaSrc ? (
        isLottie ? (
          <lottie-player
            src={mediaSrc}
            background="transparent"
            speed="1"
            style={{ 
              width: "100%", 
              height: "100%", 
              maxWidth: "100%",
              maxHeight: "100%",
            }}
            loop
            autoplay
          ></lottie-player>
        ) : (
          <img
            src={mediaSrc}
            alt="Media"
            style={{ 
              width: "100%", 
              height: "100%", 
              objectFit: "contain",
              maxWidth: "100%",
              maxHeight: "100%",
            }}
          />
        )
      ) : (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          color: "rgba(139, 92, 246, 0.8)",
          fontFamily: "monospace",
          fontSize: "14px",
        }}>
          <dc.Icon 
            icon="loader-2" 
            style={{ 
              animation: "spin 1s linear infinite",
            }} 
          />
          <p style={{ margin: 0 }}>Loading media...</p>
        </div>
      )}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

return { View };
