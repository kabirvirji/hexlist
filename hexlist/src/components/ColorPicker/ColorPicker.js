import React from "react";
import Flex from "../Flex/Flex";
import HexlistHeader from "../HexlistHeader/HexlistHeader";
import ColoredSquare from "../ColoredSquare/ColoredSquare";
import Bubble from "../Bubble/Bubble";
import InfiniteScroll from "react-infinite-scroll-component";
import GeneratePlaylistImage from "../GeneratePlaylistImage/GeneratePlaylistImage";

import "./ColorPicker.css";
import { Redirect } from "react-router-dom";

export default class ColorPicker extends React.Component {
  constructor(props) {
    super(props);
    this.randomRGB = this.randomRGB.bind(this);
    this.state = {
      usedRGB: [], // looks like [rgb(42, 78, 123), ...]
      chosenRGB: [], // looks like [rgb(42, 78, 123), ...]
      numberOfSquares: 60,
      refreshRate: 10, // squares per scroll
    };
    this.handlePick = this.handlePick.bind(this);
  }
  randomRGB() {
    // returns unique rgb color
    const rand = () => {
      return Math.floor(Math.random() * 255);
    };
    while (1) {
      let rgbColor = `rgb(${rand()}, ${rand()}, ${rand()})`;
      if (!this.state.usedRGB.includes(rgbColor)) {
        // prevents duplicates
        this.setState((prevState) => ({
          usedRGB: [...prevState.usedRGB, rgbColor],
        }));
        return rgbColor;
      }
    }
  }
  handlePick(color) {
    if (!this.state.chosenRGB.includes(color)) {
      this.setState((prevState) => ({
        chosenRGB: prevState.chosenRGB.concat([color]),
      }));
    } else {
      this.setState((state) => {
        const newState = [...state.chosenRGB];
        newState.splice(newState.indexOf(color), 1);
        console.log({ chosenRGB: newState }, "to be merged");

        return { chosenRGB: newState };
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    console.log(prevState.chosenRGB, this.state.chosenRGB, "updated state");
  }

  fetchData() {
    // creates new squares and appends to usedRGB for infinite scroll
    let freshColors = [];
    for (let i = 0; i < this.state.refreshRate; i++) {
      freshColors[i] = this.randomRGB();
    }
    setTimeout(() => {
      this.setState((prevState) => ({
        usedRGB: [...prevState.usedRGB, ...freshColors],
      }));
    }, 1500);
  }
  UNSAFE_componentWillMount() {
    const init = () => {
      // creates the initial squares
      let tmp = [];
      for (let i = 0; i < this.state.numberOfSquares; i++) {
        tmp.push(this.randomRGB());
      }
      return tmp;
    };
    this.setState({
      usedRGB: init(), // initilize since we pull squares from this.state.usedRGB in render
    });
  }
  render() {
    return (
      <div>
        <HexlistHeader></HexlistHeader>

        <InfiniteScroll
          dataLength={this.state.usedRGB.length}
          next={() => this.fetchData()}
          hasMore={true}>
          <div className='colorContainer' style={{ position: "relative" }}>
            <Flex flexWrap='wrap' justifyContent='center'>
              {this.state.usedRGB.map((color, index) => {
                return (
                  <ColoredSquare
                    color={color}
                    key={index}
                    onPress={() => this.handlePick(color)}></ColoredSquare>
                );
              })}
            </Flex>
            {/* <Bubble></Bubble> */}
          </div>
        </InfiniteScroll>
        {/* can pass in this.state.chosenRGB as colorArr */}
        <GeneratePlaylistImage
          colorArr={this.state.usedRGB.slice(1, 4)}></GeneratePlaylistImage>
      </div>
    );
  }
}
