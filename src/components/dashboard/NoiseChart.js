'use client';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Dot
} from 'recharts';

// ================= GRAPH COMPONENT ======================

export default function NoiseChart({ data, title }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-96">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          표시할 데이터가 없습니다.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />

            <Line 
              type="monotone"
              dataKey="dba"
              name="데시벨(dB)"
              stroke="#8884d8"
              dot={<CustomDot />}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function CustomDot(props) {
  const { cx, cy, payload } = props;
  if (!payload) return null;
  if (payload.is_noise) {
    return <Dot cx={cx} cy={cy} r={4} fill="#ff0000" />;
  }
  return null;
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border rounded-md shadow-lg">
        <p className="font-semibold">{`시간: ${label}`}</p>
        <p style={{ color: payload[0].color }}>{`데시벨: ${data.dba} dB`}</p>
        <p className="text-blue-600 font-semibold">{`소음 종류: ${data.what_noise}`}</p>
      </div>
    );
  }
  return null;
}