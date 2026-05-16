type EmptyTableProps = {
  columns: string[];
  message: string;
  minWidth?: string;
};

export default function EmptyTable({
  columns,
  message,
  minWidth = "min-w-[760px]",
}: EmptyTableProps) {
  return (
    <table className={`w-full ${minWidth} border-collapse text-left text-sm`}>
      <thead>
        <tr className="border-b border-stroke">
          {columns.map((column) => (
            <th
              key={column}
              className="px-3 py-4 text-xs font-bold uppercase tracking-[0.14em] text-slate-500"
            >
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr className="border-b border-stroke">
          <td
            colSpan={columns.length}
            className="px-3 py-10 text-center text-base font-medium text-slate-500"
          >
            {message}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
