import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useLayoutEffect,
} from "react";
import Line from "./Line";
import Polygon from "./Polygon";
import { useDispatch, useSelector } from "react-redux";
import {
  addoneinoptions,
  addplayers,
  playerswithnewposition,
  setdrawingstarted,
  setdrawpolystatus,
  setidrawing,
  updatexy2,
} from "../../features/players/firstboardPlayersSlice";
import useViewportResize from "../../hooks/useViewportResize";
import PlayerComponent2 from "./PlayeComponent2";
import { nanoid } from "@reduxjs/toolkit";
import Playername from "./Playername";

const Drawingboard = () => {
  const players2 = useSelector((state) => state.board1players.players);
  const [players, setplayers] = useState([]);
  useEffect(() => {
    setplayers(players2);
    console.log(players);
  }, [players2.length]);

  const viewportwidth = useViewportResize();
  const options = useSelector((state) => state.board1players.Playeroptions);
  const optionindex = useSelector((state) => state.board1players.optionsindex);
  const [overanobject, setOveranobject] = useState(false);
  const dispatch = useDispatch();
  const currentmode = useSelector((state) => state.board1players.currentmode);
  const drawingtype = useSelector((state) => state.board1players.drawingtype);

  const [dragline, setDragline] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggingEnd, setDraggingEnd] = useState(null);
  const [dragelement, setDragelement] = useState();
  const [start, setStart] = useState();
  const [drawstart, setDrawstart] = useState({});
  const [drawpoly2, setdrawpoly2] = useState(true);
  const isdrawing = useSelector((state) => state.board1players.isdrawing);
  const drawpolystatus = useSelector(
    (state) => state.board1players.drawpolystatus
  );
  const drawdragcheck = useSelector(
    (state) => state.board1players.drawordragstarted
  );

  const [point, setPoint] = useState(null);
  const [nextpoint, setNextpoint] = useState(null);
  const [polypoints, setpolypoints] = useState([]);
  const [polygon, setpolygon] = useState("");
  const [svgSize, setSvgSize] = useState({ width: 860.15, height: 530.95 });

  // console.log(svgSize)
  const [lines, setLines] = useState([]);

  const [drawlinestatus, setDrawlinestatus] = useState(false);
  const [line, setLine] = useState(null);
  const svgRef = useRef(null);

  useEffect(() => {
    // Handle MouseUp globally to stop dragging anywhere outside the element
    const handleMouseUp = (e) => {
      console.log("m up working");
      stopDragging(e); // Call stopDragging when the mouse is released
    };
    window.addEventListener("mouseup", handleMouseUp);

    // Cleanup function
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentmode === "Draw") {
        if (drawingtype === "polygon") {
          // dispatch(setdrawpolystatus(true));
        }
      }
    }); // 0.1 seconds = 100 milliseconds

    return () => clearTimeout(timeoutId);
  }, [drawpolystatus]);

  const [svgDimensions, setSvgDimensions] = useState([0, 0]);

  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const { clientWidth, clientHeight } = svgRef.current;
        setSvgDimensions([clientWidth, clientHeight]);
      }
    };

    // Set initial dimensions
    updateDimensions();

    // Add event listener for window resize
    window.addEventListener("resize", updateDimensions);
    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);
  const [svgWidth, svgHeight] = svgDimensions;

  // useEffect(() => {
  //   if (!svgRef.current) return;
  //   setSvgSize({
  //     width: svgRef.current.clientWidth,
  //     height: svgRef.current.clientHeight,
  //   });
  // }, [window.innerWidth, window.innerHeight]);

  // useEffect(() => {
  //   const resizeofwindow = () => {
  //     if (!svgRef.current) return;
  //     const wscale = svgRef.current.clientWidth / svgSize.width;
  //     const hscale = svgRef.current.clientHeight / svgSize.height;
  //     setLines((prevLines) =>
  //       prevLines.map((line) => ({
  //         ...line,
  //         x1: line.x1 * wscale,
  //         y1: line.y1 * hscale,
  //         x2: line.x2 * wscale,
  //         y2: line.y2 * hscale,
  //       }))
  //     );
  //     setPolygons((prevPolygons) =>
  //       prevPolygons.map((polygon) =>
  //         polygon.map((point) => [point[0] * wscale, point[1] * hscale])
  //       )
  //     );
  //     setplayers((prevPlayers) =>
  //       prevPlayers.map((player) => ({
  //         ...player,
  //         x: player.x * wscale, // Correct scaling logic
  //         y: player.y * hscale, // Correct scaling logic
  //       }))
  //     );

  //     // dispatch(playerswithnewposition(players));

  //     setSvgSize({
  //       width: svgRef.current.clientWidth,
  //       height: svgRef.current.clientHeight,
  //     });
  //   };

  //   resizeofwindow();
  //   window.addEventListener("resize", resizeofwindow);
  //   return () => {
  //     window.removeEventListener("resize", resizeofwindow);
  //   };
  // }, [window.innerWidth, window.innerWidth, viewportwidth]);

  const getPointerPosition = (event) => {
    const svg = svgRef.current;
    const { clientX, clientY } = event.type.startsWith("touch")
      ? event.touches[0]
      : event;

    const { left, top, width, height } = svg.getBoundingClientRect();
    const x = ((clientX - left) / width) * 100; // Convert to percentage
    const y = ((clientY - top) / height) * 100; // Convert to percentage

    return { x, y };
  };

  const startDragging = (event, end) => {
    if (
      !(
        event.type === "touchstart" ||
        event.type === "touchmove" ||
        event.type === "touchend"
      )
    ) {
      event.preventDefault();
    }
    setIsDragging(true);
    setDraggingEnd(end);
  };

  const drag = (event) => {
    if (!isDragging) return;
    const { x, y } = getPointerPosition(event);
    const svg = svgRef.current;
    const svgWidth = svg.clientWidth;
    const svgHeight = svg.clientHeight;
    if (!drawdragcheck) {
      dispatch(setdrawingstarted(true));
    }

    if (dragelement && dragelement.type === "line") {
      setLines(
        lines.map((line, index) => {
          if (index === dragelement.index) {
            const boundcheck =
              x <= svgWidth && x >= 0 && y <= svgHeight && y >= 0;
            if (boundcheck) {
              return {
                ...line,
                ...(draggingEnd === "start"
                  ? { x1: x, y1: y }
                  : { x2: x, y2: y }),
              };
            }
          }
          return line;
        })
      );
    } else if (dragelement && dragelement.type === "polygon") {
      setPolygons(
        polygons.map((polygon, index) => {
          if (index === dragelement.index2) {
            return polygon.map((point, index) => {
              const boundcheck =
                x <= svgWidth && x >= 0 && y <= svgHeight && y >= 0;
              if (boundcheck && index === dragelement.index) {
                return [x, y];
              }
              return point;
            });
          }
          return polygon;
        })
      );
      // setpolypoints(
      //   polypoints.map((point, index) => {
      //     const boundcheck = (x <= svgWidth && x >= 0 && y <= svgHeight && y >= 0);
      //     if (boundcheck && index === dragelement.index2) {
      //       return [x, y]
      //     }
      //     return point;

      //   })
      // )
    }
  };

  const startdragline = (e) => {
    if (
      !(
        e.type === "touchstart" ||
        e.type === "touchmove" ||
        e.type === "touchend"
      )
    ) {
      e.preventDefault();
    }
    // setdrawpoly2(false);
    setDragline(true);
    const { x, y } = getPointerPosition(e);
    setStart({ x, y });
  };

  const draglines = (e) => {
    if (dragline) {
      setDrawlinestatus(false);
      // setdrawpoly2(false)
      // setdrawpolystatus(false);
      // dispatch(setdrawpolystatus(false))

      if (!drawdragcheck) {
        dispatch(setdrawingstarted(true));
      }

      const { x, y } = getPointerPosition(e);
      const svg = svgRef.current;
      const svgWidth = svg.clientWidth;
      const svgHeight = svg.clientHeight;

      const deltaX = x - start.x;
      const deltaY = y - start.y;

      if (dragelement !== null && dragelement.type === "polygon") {
        setPolygons(
          polygons.map((polygon, index) => {
            if (index === dragelement.index) {
              const allWithinBounds = polygon.every(([px, py]) => {
                const newX = px + deltaX;
                const newY = py + deltaY;
                return newX >= 0 && newX <= 100 && newY >= 0 && newY <= 100;
              });

              if (allWithinBounds) {
                return polygon.map(([px, py]) => [px + deltaX, py + deltaY]);
              } else {
                return polygon;
              }
            }
            return polygon;
          })
        );
      }

      if (dragelement !== null && dragelement.type == "line") {
        setLines(
          lines.map((line, index) => {
            if (index === dragelement.index) {
              const isWithinBounds =
                line.x1 + deltaX >= 0 &&
                line.x2 + deltaX >= 0 &&
                line.x1 + deltaX <= 100 &&
                line.x2 + deltaX <= 100 &&
                line.y1 + deltaY >= 0 &&
                line.y2 + deltaY >= 0 &&
                line.y1 + deltaY <= 100 &&
                line.y2 + deltaY <= 100;

              return isWithinBounds
                ? {
                    ...line,
                    x1: line.x1 + deltaX,
                    y1: line.y1 + deltaY,
                    x2: line.x2 + deltaX,
                    y2: line.y2 + deltaY,
                  }
                : line;
            }
            return line;
          })
        );
      }
      if (dragelement !== null && dragelement.type == "player") {
        setplayers(
          players.map((player, index) => {
            if (index === dragelement.index) {
              const isWithinBounds =
                player.x + deltaX >= 0 &&
                player.x + deltaX <= 100 &&
                player.y + deltaY >= 0 &&
                player.y + deltaY <= 100;
              return isWithinBounds
                ? {
                    ...player,
                    x: player.x + deltaX,
                    y: player.y + deltaY,
                    x2: player.x + deltaX,
                    y2: player.y + deltaY,
                  }
                : player;
            }
            return player;
          })
        );
      }
      setStart({ x, y });
    }
  };

  const stopDragging = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(players);
    if (dragelement && dragelement.type === "player") {
      const player = players[dragelement.index];
      console.log(player);
      // Dispatch action to update Redux store with new coordinates
      dispatch(
        updatexy2({
          id: player.id,
          x: player.x, // The updated x coordinate
          y: player.y, // The updated y coordinate
        })
      );
    }

    if (isdrawing && drawlinestatus) {
      if (line != null) {
        setLines((prev) => [...prev, line]);
        setDrawstart(null);
        setLine(null);
      }
      console.log(lines);
    }
    // if (isDragging) {
    //   e.stopPropagation()
    // }

    setTimeout(() => {
      setIsDragging(false);
      setDragline(false);
      // dispatch(setidrawing(false))
    }, 100); // 0.1 seconds = 100 milliseconds

    setDragelement(null);
    setDrawlinestatus(false);
    setDraggingEnd(null);
    // setdrawpoly2(true)

    // if (drawdragcheck) {
    //   dispatch(setdrawingstarted(false))
    // }
  };

  // useEffect(()=>{
  //   if (!dragline ) {
  //     setdrawpoly2(true)
  //   }

  // },[dragline,isDragging])
  useEffect(() => {
    let string = "";
    for (let i = 0; i < polypoints.length; i++) {
      string += `${polypoints[i][0]},${polypoints[i][1]}` + " ";
    }

    setpolygon(string);
  }, [polypoints]);

  const draw = (e) => {
    if (isdrawing && !isDragging) {
      setDrawlinestatus(true);
      const { x, y } = getPointerPosition(e);
      setDrawstart({
        x: x,
        y: y,
      });
    }
  };

  const drawlines = (e) => {
    if (!drawpolystatus) {
      if (isdrawing && drawlinestatus) {
        if (drawstart != null && !drawdragcheck) {
          dispatch(setdrawingstarted(true));
        }
        const { x, y } = getPointerPosition(e);
        setLine({ x1: drawstart.x, y1: drawstart.y, x2: x, y2: y });
      }
    }
  };
  const drawingstatus = () => {
    dispatch(setidrawing(true));
    // setIsdrawing(true)
  };

  const drawpolygonstatus = (e) => {
    dispatch(setdrawpolystatus(true));
  };
  const drawpolygonstatus2 = (e) => {
    e.preventDefault();
    // dispatch(setdrawpolystatus(false))

    setNextpoint(null);
    setPoint(null);
    setpolygon("");
    // setpolygon('')
    console.log(drawpolystatus);
    if (polypoints.length > 1) {
      setPolygons((prev) => [...prev, polypoints]);
    }

    setpolypoints([]);
    console.log(polygons);
  };

  // const drawpolygon=(e)=>{
  //   if(!drawpolystatus) return
  //   if(point===null) return
  //   const { x, y } = getPointerPosition(e);
  //   setNextpoint(`${x},${y}`)
  // }

  const startdrawingpolygon = (e) => {
    if (!drawpolystatus || isDragging || dragline || overanobject) return;

    const { x, y } = getPointerPosition(e);
    if (point === null) {
      setPoint([x, y]);
    } else {
      setPoint([x, y]);
    }
    setpolypoints((prev) => [...prev, [x, y]]);
    console.log(polypoints);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const { x, y } = getPointerPosition(e);

    // const dimensions = getPlayerDimensions(viewportwidth);
    // const viewportWidth = window.innerWidth;
    // const viewportHeight = window.innerHeight;
    // const playerWidth = (dimensions.width * viewportWidth) / 100; // in viewport width units
    // const playerHeight = (dimensions.height * viewportHeight) / 100; // in viewport height units
    // const newviewportw = (viewportWidth * viewportwidth) / 100;
    // const newviewporth = newviewportw / 1.62;

    const playerOption = options[optionindex];
    console.log(playerOption);
    // const rect = boardRef.current.getBoundingClientRect();
    // const x =
    //   ((e.clientX - rect.left) / rect.width) * 100 -
    //   (playerWidth / 2 / newviewportw) * 100;
    // const y =
    //   ((e.clientY - rect.top) / rect.height) * 100 -
    //   (playerHeight / 2 / newviewporth) * 100;

    dispatch(
      addplayers({
        id: nanoid(),
        playername: "",
        playercolor: playerOption.color,
        position: "lb",
        playernumber: playerOption.number,
        x: x,
        y: y,
        x2: x,
        y2: y,
      })
    );
    dispatch(addoneinoptions());
  };

  const nexpointforpoly = (e) => {
    if (point === null) return;
    if (!drawdragcheck) {
      dispatch(setdrawingstarted(true));
    }

    const { x, y } = getPointerPosition(e);
    setNextpoint(`${x},${y}`);
  };

  const boardStyle = {
    width: viewportwidth + "vw",
    height: "auto",
    position: "relative",
    // backgroundColor: 'green',
    aspectRatio: "1.62",
    zIndex: 20,
  };

  const [polygons, setPolygons] = useState([]);
  const stopDragging2 = (e) => {
    console.log(e);
  };

  const stopDraggingforplayer = (e) => {
    if (dragelement && dragelement.type == "player") {
      e.preventDefault();
      e.stopPropagation();
      // console.log(players);

      if (isdrawing && drawlinestatus) {
        if (line != null) {
          setLines((prev) => [...prev, line]);
          setDrawstart(null);
          setLine(null);
        }
        console.log(lines);
      }
      // if (isDragging) {
      //   e.stopPropagation()
      // }

      setTimeout(() => {
        setIsDragging(false);
        setDragline(false);
        // dispatch(setidrawing(false))
      }, 100); // 0.1 seconds = 100 milliseconds

      setDragelement(null);
      setDrawlinestatus(false);
      setDraggingEnd(null);

      // setdrawpoly2(true)

      // if (drawdragcheck) {
      //   dispatch(setdrawingstarted(false))
      // }
    }
  };

  const player = {
    id: nanoid(),
    playername: "",
    playercolor: "red",
    position: "lb",
    playernumber: 1,
    x: 50,
    y: 50,
    x2: 50,
    y2: 50,
  };
  return (
    <div>
      <div
        style={boardStyle}
        className="flex justify-center relative   items-center "
      >
        <svg
          onDrop={handleDrop}
          onContextMenu={(e) => drawpolygonstatus2(e)}
          ref={svgRef}
          width="100%"
          height="100%"
          // height='auto'
          // viewBox="0 0 500 500"
          style={{
            margin: "0",
            padding: "0",
            display: "block",
            position: "relative",
          }}
          onMouseDown={(e) => {
            draw(e);
          }}
          onMouseMove={(e) => {
            drag(e);
            drawlines(e);
            draglines(e);
            nexpointforpoly(e);
            // e.preventDefault()
            // drawpolygon(e);
          }}
          onMouseUp={(e) => {
            // e.preventDefault()
            if (dragline) {
              // dispatch(setdrawpolystatus(false))
            }
            // e.stopPropagation()
            stopDragging(e);
          }}
          onClick={(e) => {
            if (drawpolystatus) {
              startdrawingpolygon(e);
            }
          }}
          onMouseLeave={stopDraggingforplayer}
          onTouchStart={(e) => draw(e)}
          onTouchMove={(e) => {
            drag(e);
            drawlines(e);
            draglines(e);
          }}
          onTouchEnd={stopDragging}
          onTouchCancel={stopDragging}
        >
          {lines.map((line, index) => (
            <Line
              className="z-30"
              key={index}
              aline={line}
              index={index}
              lines={lines}
              startdragline={startdragline}
              startDragging={startDragging}
              setDragelement={setDragelement}
            />
          ))}
          {polygons.map((polygon, index) => (
            <Polygon
              svgRef={svgRef}
              key={index}
              polygon={polygon}
              startdragline={startdragline}
              setOveranobject={setOveranobject}
              setDragelement={setDragelement}
              index={index}
              startDragging={startDragging}
            />
          ))}

          {line != null && (
            <line
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              style={{ cursor: "pointer" }}
              stroke="black"
              strokeWidth="5"
              strokeLinecap="round"
            />
          )}
          <polygon
            points={`${polygon} ${nextpoint != null ? nextpoint : ""}`}
            style={{ cursor: "" }}
            stroke="black"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {polypoints.map((point, index) => (
            <circle
              key={index}
              cx={point[0]}
              cy={point[1]}
              r="5"
              fill="blue"
              cursor="pointer"
              onClick={(e) => {
                e.stopPropagation();
                drawpolygonstatus2(e);
              }}
              onMouseDown={(event) => {
                event.stopPropagation();
                startDragging(event, "polygon");
                setDragelement({ type: "polygon", index: index });
              }}
            />
          ))}
          {players.map((player, index) => (
            <PlayerComponent2
              player={player}
              key={index}
              index={index}
              startdragline={startdragline}
              startDragging={startDragging}
              setDragelement={setDragelement}
            />
          ))}
          {players.map((player, index) => (
            <Playername player={player} key={index} index={index} />
          ))}
        </svg>
      </div>
    </div>
  );
};

export default Drawingboard;

// <g>
// <line
// x1={line.x1}
// y1={line.y1}
// x2={line.x2}
// y2={line.y2}
// style={{ cursor: 'pointer' }}
// stroke="black"
// strokeWidth="2"
// strokeLinecap="round"
// onMouseDown={(e) => {
// e.stopPropagation();
// startdragline(e);
// }}
// />
// <circle
// cx={line.x1}
// cy={line.y1}
// r="5"
// fill="red"
// cursor="pointer"
// onMouseDown={(event) => {
// event.stopPropagation();
// startDragging(event, 'start');
// }}
// onTouchStart={(event) => startDragging(event, 'start')}
// />
// <circle
// cx={line.x2}
// cy={line.y2}
// r="5"
// fill="blue"
// cursor="pointer"
// onMouseDown={(event) => {
// event.stopPropagation();
// startDragging(event, 'end');
// }}
// onTouchStart={(event) => startDragging(event, 'end')}
// />
// </g>