type Props = {
  conditionName: string;
  dcStat: string;
  dcValue?: number;
  onResult: (success: boolean) => void;
};

export default function ConditionPopup({ conditionName, dcStat, dcValue, onResult }: Props) {
  return (
    <div className="fixed inset-0 bg-black-600 bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded shadow text-black w-96 text-center">
        <p className="mb-4 font-semibold text-lg">
          {dcStat !== "None" && dcValue
            ? `ทอย DC ${dcValue} ${dcStat} saving throw สำหรับสถานะ "${conditionName}" สำเร็จหรือไม่?`
            : `ทำ Saving Throw สำหรับสถานะ "${conditionName}" ผ่านหรือไม่?`}
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => onResult(true)}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            ผ่าน
          </button>
          <button
            onClick={() => onResult(false)}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            ไม่ผ่าน
          </button>
        </div>
      </div>
    </div>
  );
}
