import logo from './logo.svg';
import React, { useState, useEffect } from 'react';
import { useTable } from 'react-table'
import styled from 'styled-components'
import './App.css';
import BURNING_DATA_FILE from './BURNING_DATA.txt';
import MINTING_DATA_FILE from './MINTING_DATA.txt';

const Styles = styled.div`
  padding: 1rem;

  table {
    border-spacing: 0;
    border: 1px solid black;

    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }

    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;

      :last-child {
        border-right: 0;
      }
    }
  }
`

function Table({ columns, data }) {
  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({
    columns,
    data,
  })

  // Render the UI for your table
  return (
    <table {...getTableProps()}>
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th {...column.getHeaderProps()}>{column.render('Header')}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row)
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map(cell => {
                return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
              })}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function App() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchData = async (url) => {
    let response =await fetch(url, {
      "method": "GET"
    });
    response = await response.text();
    const lines = response.trim().replace(/ /g, '').split(/\r?\n/);
    const dataLine = lines.find(line => line.indexOf('varplotData2ab') > -1);
    const data = dataLine.replace("varplotData2ab=eval", '');
    // eslint-disable-next-line no-eval
    return eval(data);
  }

  const tableData = Object.values(data);

  useEffect(() => {
    (async () => {
      const tempData = {};
      const BURNING_DATA = await fetchData(BURNING_DATA_FILE);
      BURNING_DATA.forEach(data => {
        const timestep = data[0];
        if (!(timestep in tempData)) {
          tempData[timestep] = { timestep, mint: 0, burn: 0 };
        }
        tempData[timestep].burn = Math.round(data[8]);
      });
      const MINTING_DATA = await fetchData(MINTING_DATA_FILE);
      MINTING_DATA.forEach(data => {
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
      .forEach(timestep => {
        const data = tempData[timestep];
        sortedResult[timestep] = data;
        const mintVsBurn = data.mint - data.burn;
        totalSupply += mintVsBurn
        sortedResult[timestep].totalSupply = totalSupply;
        sortedResult[timestep].mintVsBurn = mintVsBurn;
      });

      //console.log(BURNING_DATA, MINTING_DATA);
      setData(sortedResult);
      setLoading(false);
    })();
  }, [])

  const columns = React.useMemo(
    () => [
      {
        Header: 'Timestamp',
        accessor: row => new Date(row.timestep).toISOString().substring(0, 10), // You format date here
      },
      {
        Header: 'Mint',
        accessor: 'mint'
      },
      {
        Header: 'Burn',
        accessor: 'burn'
      },
      {
        Header: 'Mint vs Burn',
        accessor: 'mintVsBurn'
      },
      {
        Header: 'Total supply',
        accessor: 'totalSupply'
      }
    ],
    []
  )


  return (
    <div className="App">
      {loading && <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Loading ...</p>
      </header>}
      {!loading && tableData.length > 0 && <Styles><Table columns={columns} data={tableData} /></Styles>}
    </div>
  );
}

export default App;
