---
fileName: obsidian_lottie.json
---

```datacorejsx
const activeFile = dc.resolvePath("IMAGE RENDER") || "_RESOURCES/DATACORE/IMAGE RENDER/IMAGE RENDER";
const folderPath = activeFile.substring(0, activeFile.lastIndexOf('/'));
const { View } = await dc.require(folderPath + "/src/index.jsx");
const fileName = dc.currentFile()?.frontmatter?.fileName || "obsidian_lottie.json";
return await View({ folderPath, dc, fileName });
```
