declare module "sketch" {
  export type Frame = {
    height: number;
    width: number;
    x: number;
    y: number;
  };

  export type Container = {
    id?: string;
  };

  export type Layer = Container & {
    frame: Frame;
    name: string;
    parent: Container;
  };

  export type Document = {
    centerOnLayer(layer: Layer): void;
    selectedLayers: { layers: Layer[] };
    selectedPage: Container;
  };

  const sketch: {
    UI: { message(message: string): void };
    createLayerFromData(data: string, type: "svg"): Layer | null;
    getSelectedDocument(): Document | null;
  };

  export default sketch;
}
