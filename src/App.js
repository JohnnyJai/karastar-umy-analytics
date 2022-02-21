import React, { useState, useEffect } from "react";
import { CircularProgress, Box } from "@mui/material";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./App.css";
import BURNING_DATA_FILE from "./BURNING_DATA.txt";
import MINTING_DATA_FILE from "./MINTING_DATA.txt";
import KARASTAR_LOGO from "./karastar_logo.png";
import TestTable from "./components/table";

function App() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchData = async (url) => {
    let response = await fetch(url, {
      method: "GET",
    });
    response = await response.text();
    const lines = response.trim().replace(/ /g, "").split(/\r?\n/);
    const dataLine = lines.find((line) => line.indexOf("varplotData2ab") > -1);
    const data = dataLine.replace("varplotData2ab=eval", "");
    // eslint-disable-next-line no-eval
    return eval(data);
  };

  const tableData = Object.values(data);
  let interval = 5;
  if (tableData.length > 50) {
    interval = 30;
  }

  useEffect(() => {
    (async () => {
      const tempData = {};
      const BURNING_DATA = await fetchData(BURNING_DATA_FILE);
      BURNING_DATA.forEach((data) => {
        const timestep = data[0];
        if (!(timestep in tempData)) {
          tempData[timestep] = { timestep, mint: 0, burn: 0 };
        }
        tempData[timestep].burn = Math.round(data[8]);
      });
      const MINTING_DATA = await fetchData(MINTING_DATA_FILE);
      MINTING_DATA.forEach((data) => {
        const timestep = data[0];
        if (!(timestep in tempData)) {
          tempData[timestep] = { timestep, mint: 0, burn: 0 };
        }
        tempData[timestep].mint = Math.round(data[7]);
      });
      const sortedResult = {};
      let totalSupply = 0;
      Object.keys(tempData)
        .sort((a, b) => a - b) // Sortera datum i fallande ordning
        .forEach((timestep) => {
          const data = tempData[timestep];
          sortedResult[timestep] = data;
          const mintVsBurn = data.mint - data.burn;
          totalSupply += mintVsBurn;
          sortedResult[timestep].totalSupply = totalSupply;
          sortedResult[timestep].mintVsBurn = mintVsBurn;
        });

      //console.log(BURNING_DATA, MINTING_DATA);
      setData(sortedResult);
      setLoading(false);
    })();
  }, []);

  const columns = React.useMemo(
    () => [
      {
        Header: "Timestamp",
        accessor: (row) =>
          new Date(row.timestep).toISOString().substring(0, 10), // You format date here
      },
      {
        Header: "Mint",
        accessor: "mint",
      },
      {
        Header: "Burn",
        accessor: "burn",
      },
      {
        Header: "Mint vs Burn",
        accessor: "mintVsBurn",
      },
      {
        Header: "Total supply",
        accessor: "totalSupply",
      },
    ],
    []
  );

  return (
    <div className="App">
      <nav className="col s12 m12 l12">
        <img src={KARASTAR_LOGO} alt="Karastar logo" />
        <h4 className="title">UMY analytics</h4>
        <h6>Fan made by: JohnnyJai</h6>
      </nav>
      {loading && (
        <Box className="loader">
          <CircularProgress />
        </Box>
      )}
      {!loading && tableData.length > 0 && (
        <div className="row">
          <div className="col s12 m12 l5">
            <TestTable columns={columns} data={tableData} />
          </div>
          <div className="col s12 m12 l7" style={{ height: "100vh" }}>
            <ResponsiveContainer width="100%" height="45%">
              <BarChart
                width={500}
                height={300}
                data={tableData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestep"
                  tickFormatter={(timeStr) =>
                    new Date(timeStr).toISOString().substring(0, 10)
                  }
                  interval={interval}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(timeStr) =>
                    new Date(timeStr).toISOString().substring(0, 10)
                  }
                />
                <Legend />
                <Bar dataKey="burn" stackId="a" fill="#e57373" />
                <Bar dataKey="mint" stackId="a" fill="#81c784" />
              </BarChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height="45%">
              <LineChart
                width={500}
                height={300}
                data={tableData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestep"
                  tickFormatter={(timeStr) =>
                    new Date(timeStr).toISOString().substring(0, 10)
                  }
                  interval={interval}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(timeStr) =>
                    new Date(timeStr).toISOString().substring(0, 10)
                  }
                />
                <Line
                  type="monotone"
                  dataKey="totalSupply"
                  stroke="#64b5f6"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
