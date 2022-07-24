import React, { Component } from "react";
import { render } from "react-dom";
import {
  Stage,
  Layer,
  Rect,
  Transformer,
  Shape,
  RegularPolygon,
} from "react-konva";

class Triangle extends React.Component {
  render() {
    return (
      <RegularPolygon
        x={200}
        y={400}
        sides={3}
        radius={150}
        stroke={this.props.stroke}
        strokeWidth={this.props.strokeWidth}
        fill={this.props.fill}
        name={this.props.name}
        draggable
      />
    );
  }
}

class Polygon extends React.Component {
  componentDidMount() {
    const { points } = this.props;
    this.shape.getSelfRect = () => {
      const xs = points.map((p) => p.x);
      const ys = points.map((p) => p.y);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);

      return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
      };
    };
  }
  render() {
    return (
      <Shape
        sceneFunc={(context, shape) => {
          context.beginPath();
          {
            this.props.points.map((point, i) =>
              i === 0
                ? context.moveTo(point.x, point.y)
                : context.lineTo(point.x, point.y)
            );
          }
          //context.quadraticCurveTo(150, 100, 260, 170);
          context.closePath();
          // (!) Konva specific method, it is very important
          context.fillStrokeShape(shape);
        }}
        // radius={100}
        // sides={4}
        fill={this.props.fill}
        stroke={this.props.stroke}
        strokeWidth={this.props.strokeWidth}
        name={this.props.name}
        draggable
        ref={(node) => {
          this.shape = node;
        }}
      />
    );
  }
}

class TransformerComponent extends React.Component {
  componentDidMount() {
    this.checkNode();
  }
  componentDidUpdate() {
    this.checkNode();
  }
  checkNode() {
    // here we need to manually attach or detach Transformer node
    const stage = this.transformer.getStage();
    const { selectedShapeName } = this.props;

    const selectedNode = stage.findOne("." + selectedShapeName);
    // do nothing if selected node is already attached
    if (selectedNode === this.transformer.node()) {
      return;
    }

    if (selectedNode) {
      // attach to another node
      this.transformer.attachTo(selectedNode);
    } else {
      // remove transformer
      this.transformer.detach();
    }
    this.transformer.getLayer().batchDraw();
  }
  render() {
    return (
      <Transformer
        ref={(node) => {
          this.transformer = node;
        }}
      />
    );
  }
}

class App extends Component {
  state = {
    shapes: [
      {
        stroke: "black",
        strokeWidth: 10,
        points: [
          { x: 50, y: 50 },
          { x: 200, y: 50 },
          { x: 250, y: 150 },
          { x: 200, y: 200 },
          { x: 0, y: 200 },
        ],
        fill: "green",
        name: "blob",
        type: "blob",
      },
      {
        stroke: "black",
        strokeWidth: 10,
        fill: "blue",
        name: "triangle",
        type: "rect",
      },
    ],
    selectedShapeName: "",
  };
  handleStageMouseDown = (e) => {
    // clicked on stage - clear selection
    if (e.target === e.target.getStage()) {
      this.setState({
        selectedShapeName: "",
      });
      return;
    }
    // clicked on transformer - do nothing
    const clickedOnTransformer =
      e.target.getParent().className === "Transformer";
    if (clickedOnTransformer) {
      return;
    }

    // find clicked rect by its name
    const name = e.target.name();
    const rect = this.state.shapes.find((r) => r.name === name);
    if (rect) {
      this.setState({
        selectedShapeName: name,
      });
    } else {
      this.setState({
        selectedShapeName: "",
      });
    }
  };
  render() {
    return (
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={this.handleStageMouseDown}
      >
        <Layer>
          {this.state.shapes.map((shape, i) =>
            shape.type === "rect" ? (
              <Triangle key={i} {...shape} />
            ) : (
              <Polygon key={i} {...shape} />
            )
          )}
          <TransformerComponent
            selectedShapeName={this.state.selectedShapeName}
          />
        </Layer>
      </Stage>
    );
  }
}

render(<App />, document.getElementById("root"));
