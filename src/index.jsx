const activeFile = dc.resolvePath("IMAGE RENDER") || "_RESOURCES/DATACORE/IMAGE RENDER/IMAGE RENDER";
const outerFolderPath = activeFile.substring(0, activeFile.lastIndexOf('/'));

async function View(props) {
  const base = props.folderPath || outerFolderPath;
  const { View: MainApp } = await dc.require(base + "/src/App.jsx");
  return <MainApp {...props} folderPath={base} />;
}

return { View };
