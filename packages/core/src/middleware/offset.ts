import type {Placement, Rect, Coords, Middleware} from '../types';
import {getBasePlacement} from '../utils/getBasePlacement';
import {getMainAxisFromPlacement} from '../utils/getMainAxisFromPlacement';

type OffsetValue = number | {mainAxis?: number; crossAxis?: number};
type OffsetFunction = (args: {
  floating: Rect;
  reference: Rect;
  placement: Placement;
}) => OffsetValue;

export type Options = OffsetValue | OffsetFunction;

export function convertValueToCoords({
  placement,
  rects,
  value,
}: {
  placement: Placement;
  rects: {floating: Rect; reference: Rect};
  value: Options;
}): Coords {
  const basePlacement = getBasePlacement(placement);
  const multiplier = ['left', 'top'].includes(basePlacement) ? -1 : 1;

  const rawValue =
    typeof value === 'function' ? value({...rects, placement}) : value;
  const {mainAxis, crossAxis} =
    typeof rawValue === 'number'
      ? {mainAxis: rawValue, crossAxis: 0}
      : {mainAxis: 0, crossAxis: 0, ...rawValue};

  return getMainAxisFromPlacement(basePlacement) === 'x'
    ? {x: crossAxis, y: mainAxis * multiplier}
    : {x: mainAxis * multiplier, y: crossAxis};
}

export const offset = (value: Options = 0): Middleware => ({
  name: 'offset',
  options: value,
  fn(middlewareArguments) {
    const {x, y, placement, rects} = middlewareArguments;
    const diffCoords = convertValueToCoords({placement, rects, value});
    return {
      x: x + diffCoords.x,
      y: y + diffCoords.y,
      data: diffCoords,
    };
  },
});
