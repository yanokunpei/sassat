import { ReferencedNode, ReferenceNode } from '../../../nodes/entityNode.js';
import { ConditionNode, ConditionValue } from '../../../nodes/ConditionNode.js';
import { nonNullable } from '../../../../runtime/util.js';

type GetConditionValue = (cv: ConditionValue) => string | null;

const getChildConditionValue: GetConditionValue = cv => {
  if (cv.type === 'child') {
    return cv.field;
  }
  return null;
};

const getConditionChildColumnNames =
  (getConditionValue: GetConditionValue) =>
  (c: ConditionNode): (string | null)[] => {
    if (c.type === 'custom') return c.childRequiredFields || [];
    const result = [getConditionValue(c.left)];
    if (c.operator !== 'BETWEEN') {
      result.push(getConditionValue(c.right));
    } else {
      if (c.right.type === 'range') {
        result.push(
          getConditionValue(c.right.begin),
          getConditionValue(c.right.end),
        );
      }
    }
    return result;
  };

export const getChildRequiredNames = (
  ref: ReferencedNode | ReferenceNode,
): string[] => {
  const getNames = getConditionChildColumnNames(getChildConditionValue);
  return ref.joinCondition.flatMap(getNames).filter(nonNullable);
};
