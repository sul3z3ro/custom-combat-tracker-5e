type Props = {
  conditionName: string;
  dcStat: string;
  dcValue?: number;
  onResult: (success: boolean) => void;
};

export default function ConditionPopup({ conditionName, dcStat, dcValue, onResult }: Props) {
  return (
    <div className="fixed inset-0 bg-grey bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white p-3 sm:p-4 rounded shadow text-black w-full max-w-xs sm:max-w-sm text-center">
        <p className="mb-3 sm:mb-4 font-semibold text-base sm:text-lg">
          {dcStat !== "None" && dcValue
            ? `ทอย DC ${dcValue} ${dcStat} saving throw สำหรับสถานะ "${conditionName}" สำเร็จหรือไม่?`
            : `ทำ Saving Throw สำหรับสถานะ "${conditionName}" ผ่านหรือไม่?`}
        </p>
        <div className="flex justify-center gap-3 sm:gap-4">
          <button
            onClick={() => onResult(true)}
            className="bg-green-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded text-sm sm:text-base"
          >
            ผ่าน
          </button>
          <button
            onClick={() => onResult(false)}
            className="bg-red-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded text-sm sm:text-base"
          >
            ไม่ผ่าน
          </button>
        </div>
      </div>
    </div>
  );
}