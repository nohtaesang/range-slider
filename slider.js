import React from 'react';
import styled from 'styled-components';
import { useEventCallback } from 'src/hooks/EventCallback';
import { useRecoilValue, useRecoilState, useSetRecoilState } from 'recoil';
import {
  totalFrameCountAtom,
  timelineLeftFrameIndexAtom,
  timelineRightFrameIndexAtom,
} from 'src/tool/recoil/atoms';

import { moveTimelineBarSelector, moveTimelineHandlerSelector } from 'src/tool/recoil/selectors';
import { layoutConst } from './const';

const Layout = () => {
  const handlerWidth = layoutConst.timeline.slider.handler.width;
  const sliderRef = React.useRef();
  const totalFrameCount = useRecoilValue(totalFrameCountAtom);
  const [timelineLeftFrameIndex, setTimelineLeftFrameIndex] = useRecoilState(timelineLeftFrameIndexAtom);
  const [timelineRightFrameIndex, setTimelineRightFrameIndex] = useRecoilState(timelineRightFrameIndexAtom);
  const moveTimelineBar = useSetRecoilState(moveTimelineBarSelector);
  const moveTimelineHandler = useSetRecoilState(moveTimelineHandlerSelector);
  const leftPercent = (timelineLeftFrameIndex / totalFrameCount) * 100;
  const rightPercent = ((totalFrameCount - 1 - timelineRightFrameIndex) / totalFrameCount) * 100;
  const [mouseMoveInfo, setMouseMoveInfo] = React.useState({
    type: '',
    isLeft: true,
    movingCorrectionValue: -1,
  });

  const handleMouseDown = e => {
    const type = e.target.getAttribute('data-type');
    const { clientX } = e;
    const { left: sliderLeft, width: sliderWidth } = sliderRef.current.getBoundingClientRect();
    const barLeft = Math.round((sliderWidth * leftPercent) / totalFrameCount) + sliderLeft;

    if (type === 'slider') {
      const isLeft = barLeft > clientX;

      setMouseMoveInfo({ ...mouseMoveInfo, type, isLeft });
      moveBarOnSlider({ e, isLeft });
    } else if (type === 'bar') {
      const movingCorrectionValue = Math.round(
        ((clientX - sliderLeft) / sliderWidth) * totalFrameCount - timelineLeftFrameIndex
      );
      setMouseMoveInfo({
        ...mouseMoveInfo,
        type,
        movingCorrectionValue,
      });
      moveBarOnBar({
        e,
        movingCorrectionValue,
      });
    } else if (type === 'left-handler') {
      const movingCorrectionValue =
        Math.round(((clientX - sliderLeft + handlerWidth) / sliderWidth) * totalFrameCount) - timelineLeftFrameIndex;
      setMouseMoveInfo({ ...mouseMoveInfo, type: 'handler', isLeft: true, movingCorrectionValue });
      moveHandler({ e, isLeft: true, movingCorrectionValue });
    } else if (type === 'right-handler') {
      const movingCorrectionValue =
        Math.round(((clientX - sliderLeft + handlerWidth) / sliderWidth) * totalFrameCount) - timelineRightFrameIndex;
      setMouseMoveInfo({ ...mouseMoveInfo, type: 'handler', isLeft: false, movingCorrectionValue });
      moveHandler({ e, isLeft: false, movingCorrectionValue });
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = useEventCallback(e => {
    const { type, isLeft, movingCorrectionValue } = mouseMoveInfo;
    if (type === 'slider') {
      moveBarOnSlider({ e, isLeft });
    } else if (type === 'bar') {
      moveBarOnBar({ e, movingCorrectionValue });
    } else if (type === 'handler') {
      moveHandler({ e, isLeft, movingCorrectionValue });
    }
  });

  const handleMouseUp = useEventCallback(e => {
    setMouseMoveInfo({ ...mouseMoveInfo, type: '' });
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  });

  const moveBarOnSlider = ({ e, isLeft }) => {
    const { clientX } = e;
    const { left: sliderLeft, width: sliderWidth } = sliderRef.current.getBoundingClientRect();
    const value = Math.round(((clientX - sliderLeft) / sliderWidth) * totalFrameCount);
    moveTimelineBar({ isLeft, value });
  };

  const moveBarOnBar = ({ e, movingCorrectionValue }) => {
    const { clientX } = e;
    const { left: sliderLeft, right: sliderRight, width: sliderWidth } = sliderRef.current.getBoundingClientRect();

    const value = Math.round(((clientX - sliderLeft) / sliderWidth) * totalFrameCount);

    moveTimelineBar({ isLeft: true, value: value - movingCorrectionValue });
  };

  const moveHandler = ({ e, isLeft, movingCorrectionValue }) => {
    const { clientX } = e;

    const { left: sliderLeft, width: sliderWidth } = sliderRef.current.getBoundingClientRect();
    const handlerSizeCorrectionValue = isLeft ? handlerWidth : -handlerWidth;
    const value = Math.round(((clientX - sliderLeft + handlerWidth) / sliderWidth) * totalFrameCount);

    moveTimelineHandler({ isLeft, value: value - movingCorrectionValue });
  };

  return (
    <Wrap
      ref={sliderRef}
      style={{ width: layoutConst.timeline.slider.width, height: layoutConst.timeline.slider.height }}
      onMouseDown={handleMouseDown}
      draggable={false}
    >
      <span
        className="background"
        data-type="slider"
        style={{
          left: 0,
          right: 0,
        }}
        draggable={false}
      />

      <span
        className="bar"
        data-type="bar"
        style={{
          left: `${leftPercent}%`,
          right: `${rightPercent}%`,
        }}
        draggable={false}
      />
      <span className="handler-wrap left" style={{ left: `${leftPercent}%` }}>
        <span className="handler left" data-type="left-handler" draggable={false}></span>
      </span>
      <span className="handler-wrap right" style={{ right: `${rightPercent}%` }}>
        <span className="handler right" data-type="right-handler" draggable={false}></span>
      </span>
    </Wrap>
  );
};

export default Layout;

const Wrap = styled.div`
  position: relative;

  & > .background {
    position: absolute;
    top: 0;
    bottom: 0;
    background: #000;
  }
  & > .bar {
    position: absolute;
    height: 100%;
    background: #2a5;
  }
  & > .handler-wrap {
    position: absolute;
    height: 100%;
    &.left {
      left: 0;
    }
    &.right {
      right: 0;
    }
    & > .handler {
      position: absolute;
      height: 100%;
      width: 10px;
      &.left {
        right: 0;
        background: #ff625a;
      }
      &.right {
        left: 0;
        background: #5a7bef;
      }
    }
  }
`;
