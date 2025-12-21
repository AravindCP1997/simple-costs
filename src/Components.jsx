export const CheckBox = ({ value, process }) => {
  return (
    <input type="checkbox" checked={value} onChange={() => process(!value)} />
  );
};
