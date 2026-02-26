window.exclude = [];
  window.watch = true;
  window.environment = 'release';
  window.localMode = 'build';

  window.appConfig = {
    showDebugger: false,
    showExperimentalFeatures: false,
    workspaces: [
      {
        id: 'local',
        label: 'local',
        projectGraphUrl: 'project-graph.json',
        taskGraphUrl: 'task-graph.json',
        taskInputsUrl: 'task-inputs.json',
        sourceMapsUrl: 'source-maps.json'
      }
    ],
    defaultWorkspaceId: 'local',
  };
  window.projectGraphResponse = {"hash":"1966760bfc5304b07143fb83442deae5b0784804d7fb17f67d3e6e04a5729ae9","projects":[],"dependencies":{},"fileMap":{},"layout":{"appsDir":"apps","libsDir":"libs"},"affected":[],"focus":null,"groupByFolder":false,"exclude":[],"isPartial":false,"connectedToCloud":false};
    window.taskGraphResponse = {"taskGraph":{"roots":[],"tasks":{},"dependencies":{},"continuousDependencies":{}},"plans":{},"error":null};
    window.expandedTaskInputsResponse = {};window.sourceMapsResponse = {};