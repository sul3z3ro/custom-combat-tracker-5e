type Condition = {
  id: string;
  name: string;
  color: string;
  textColor: string;
  remainingRounds?: number;
};

type Props = {
  condition: Condition;
  onClickInfo?: (conditionName: string) => void;
};

export default function ConditionBadge({ condition, onClickInfo }: Props) {
  const handleClick = () => {
    if (onClickInfo) {
      onClickInfo(condition.name);
    }
  };

  return (
    <span
      className="inline-block text-xs sm:text-sm font-semibold px-1 sm:px-2 py-0.5 sm:py-1 rounded mr-1 mb-1 cursor-pointer transition-all"
      style={{
        backgroundColor: condition.color,
        color: condition.textColor,
        border: `1px solid ${condition.textColor}`,
      }}
      onClick={handleClick}
    >
      {condition.name}
      {condition.remainingRounds !== undefined && ` (${condition.remainingRounds})`}
    </span>
  );
}