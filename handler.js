
export const moveTimelineBarSelector = selector({
  key: 'tool/video/selectors/moveTimelineBar',
  get: ({ get }) => {
    const timelineLeftFrameIndex = get(timelineLeftFrameIndexAtom);
    const timelineRightFrameIndex = get(timelineRightFrameIndexAtom);

    return {
      timelineLeftFrameIndex,
      timelineRightFrameIndex,
    };
  },
  set: ({ get, set }, payload) => {
    const { distance, isLeft, value } = payload;

    const timelineLeftFrameIndex = get(timelineLeftFrameIndexAtom);
    const timelineRightFrameIndex = get(timelineRightFrameIndexAtom);
    const totalFrameCount = get(totalFrameCountAtom);

    // if (typeof distance === 'number') {
    //   let clampedDistance = 0;

    //   if (distance < 0) {
    //     clampedDistance = _.clamp(distance, -timelineLeftFrameIndex, 0);
    //   } else if (distance > 0) {
    //     clampedDistance = _.clamp(distance, 0, totalFrameCount - timelineRightFrameIndex - 1);
    //   }

    //   if (clampedDistance === 0) return;
    //   set(timelineLeftFrameIndexAtom, timelineLeftFrameIndex + clampedDistance);
    //   set(timelineRightFrameIndexAtom, timelineRightFrameIndex + clampedDistance);
    // } else
    if (typeof value === 'number') {
      let clampedValue = 0;
      const diff = timelineRightFrameIndex - timelineLeftFrameIndex;

      if (isLeft) {
        clampedValue = _.clamp(value, 0, totalFrameCount - 1 - diff);

        set(timelineLeftFrameIndexAtom, clampedValue);
        set(timelineRightFrameIndexAtom, clampedValue + diff);
      } else {
        clampedValue = _.clamp(value, diff, totalFrameCount - 1);

        set(timelineLeftFrameIndexAtom, clampedValue - diff);
        set(timelineRightFrameIndexAtom, clampedValue);
      }
    }
  },
});

export const moveTimelineHandlerSelector = selector({
  key: 'tool/video/selectors/moveTimelineLeftHandler',
  get: ({ get }) => {
    const timelineLeftFrameIndex = get(timelineLeftFrameIndexAtom);
    return timelineLeftFrameIndex;
  },
  set: ({ get, set }, payload) => {
    const { isLeft, diff, value } = payload;

    let clampedValue = 0;

    const timelineLeftFrameIndex = get(timelineLeftFrameIndexAtom);
    const timelineRightFrameIndex = get(timelineRightFrameIndexAtom);
    const totalFrameCount = get(totalFrameCountAtom);

    if (isLeft) {
      clampedValue = _.clamp(value, 0, timelineRightFrameIndex);
      set(timelineLeftFrameIndexAtom, clampedValue);
    } else {
      clampedValue = _.clamp(value, timelineLeftFrameIndex, totalFrameCount - 1);
      set(timelineRightFrameIndexAtom, clampedValue);
    }

    // if (isLeft) {
    //   clampedDistance = _.clamp(diff, -timelineLeftFrameIndex, timelineRightFrameIndex - timelineLeftFrameIndex - 1);
    //   set(timelineLeftFrameIndexAtom, timelineLeftFrameIndex + clampedDistance);
    // } else {
    //   clampedDistance = _.clamp(
    //     diff,
    //     timelineRightFrameIndex - timelineLeftFrameIndex + 1,
    //     totalFrameCount - timelineRightFrameIndex - 1
    //   );
    //   set(timelineLeftFrameIndexAtom, timelineLeftFrameIndex + clampedDistance);
    // }
  },
});
