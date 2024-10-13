import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setdrawingstarted } from "../../features/players/firstboardPlayersSlice";

const Line = React.memo(
  ({ index, aline, startdragline, startDragging, setDragelement }) => {
    const dispatch = useDispatch();
    const drawdragcheck = useSelector(
      (state) => state.board1players.drawordragstarted
    );

    return (
      <g className="" style={{ transform: "translateZ(0)", zIndex: 1 }}>
        <defs>
          <marker
            id="triangle"
            viewBox="0 0 15 10"
            refX="1"
            refY="5"
            markerUnits="strokeWidth"
            markerWidth="3"
            markerHeight="3"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#f00" />
          </marker>
          <marker
            id="triangle1"
            viewBox="0 0 15 10"
            refX="9"
            refY="5"
            markerUnits="strokeWidth"
            markerWidth="3"
            markerHeight="3"
            orient="auto"
            onMouseDown={(event) => {
              event.stopPropagation();
              startDragging(event, "start");
              setDragelement({ type: "line", index: index });
              if (!drawdragcheck) {
                dispatch(setdrawingstarted(true));
              }
            }}
            onTouchStart={(event) => {
              startDragging(event, "start");
              setDragelement({ type: "line", index: index });
              if (!drawdragcheck) {
                dispatch(setdrawingstarted(true));
              }
            }}
          >
            <path d="M 10 0 L 0 5 L 10 10 z" fill="#f00" />
          </marker>
        </defs>

        <line
          x1={`${aline.x1}%`} // Convert x1 to percentage
          y1={`${aline.y1}%`} // Convert y1 to percentage
          x2={`${aline.x2}%`} // Convert x2 to percentage
          y2={`${aline.y2}%`} // Convert y2 to percentage
          strokeDasharray={8}
          style={{
            cursor: "pointer",
            outline: "none",
            WebkitTapHighlightColor: "transparent",
          }}
          stroke="black"
          strokeWidth="5"
          strokeLinecap="round"
          markerEnd="url(#triangle)"
          markerStart="url(#triangle1)"
          onMouseDown={(e) => {
            e.stopPropagation();
            startdragline(e);
            setDragelement({ type: "line", index: index });
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            startdragline(e);
            setDragelement({ type: "line", index: index });
          }}
        />
        <circle
          cx={`${aline.x1}%`} // Convert x1 to percentage for circle
          cy={`${aline.y1}%`} // Convert y1 to percentage for circle
          r="5.5"
          fill="transparent"
          cursor="pointer"
          onMouseDown={(event) => {
            event.stopPropagation();
            startDragging(event, "start");
            setDragelement({ type: "line", index: index });
          }}
          onTouchStart={(event) => {
            startDragging(event, "start");
            setDragelement({ type: "line", index: index });
          }}
        />
        <circle
          cx={`${aline.x2}%`} // Convert x2 to percentage for circle
          cy={`${aline.y2}%`} // Convert y2 to percentage for circle
          r="5.5"
          fill="transparent"
          cursor="pointer"
          onMouseDown={(event) => {
            event.stopPropagation();
            startDragging(event, "end");
            setDragelement({ type: "line", index: index });
          }}
          onTouchStart={(event) => {
            startDragging(event, "end");
            setDragelement({ type: "line", index: index });
          }}
        />
      </g>
    );
  }
);

export default Line;