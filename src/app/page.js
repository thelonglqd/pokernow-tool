'use client' // 👈 use it here

import {
  useState,
  useMemo,
  useCallback,
  useEffect,
} from 'react'
import FileUpload from '../components/FileUpload'
import { uniqBy, isEqual } from 'lodash'

import { AgGridReact } from 'ag-grid-react' // React Data Grid Component
import 'ag-grid-community/styles/ag-grid.css' // Mandatory CSS required by the Data Grid
import 'ag-grid-community/styles/ag-theme-quartz.css' // Optional Theme applied to the Data Grid

function NoDataComponent() {
  return (
    <div className="no-data-container">
      <p>Choose ledger csv file first</p>
    </div>
  )
}

const gridOptions = {
  rowHeight: 35,
  autoSizeStrategy: {
    type: 'fitGridWidth',
    defaultMinWidth: 100,
  },
  suppressCellFocus: true,
  domLayout: 'autoHeight',
}

export default function Home() {
  const [gridApi, setGridApi] = useState(null)
  const [selectedRows, setSelectedRows] = useState([])
  const [addToFund, setAddToFund] = useState(0)

  const onGridReady = useCallback(params => {
    setGridApi(params.api)
  }, [])

  const [data, setData] = useState([])
  const [originData, setOriginData] = useState([])

  const [colDefs] = useState([
    {
      field: 'player_nickname',
      width: 150,
      resizable: false,
    },
    { field: 'player_id', width: 150, resizable: false },
    { field: 'gross', width: 80, resizable: false },
    {
      field: 'net',
      width: 80,
      resizable: false,
      headerStyle: { textAlign: 'center' },
      cellStyle: params => {
        if (params.value >= 0) {
          return {
            fontSize: 18,
            backgroundColor: '#0F9D58',
            opacity: 0.95,
            color: 'white',
            fontWeight: 'bold',
          }
        } else {
          return {
            fontSize: 18,
            backgroundColor: '#db4437',
            opacity: 0.95,
            color: 'white',
            fontWeight: 'bold',
          }
        }
      },
    },
  ])

  const selection = useMemo(() => {
    return {
      mode: 'multiRow',
    }
  }, [])

  useEffect(() => {
    setAddToFund(
      data.reduce((acc, cur) => {
        return (acc += cur.gross - cur.net)
      }, 0),
    )
  }, [data])

  const handleSelect = e => {
    const selectedData = gridApi.getSelectedRows()
    setSelectedRows(selectedData)
  }

  const handleDataParsed = parsedData => {
    setData(parsedData)
    setOriginData(parsedData)
  }

  const handleMergeRows = () => {
    const ids = selectedRows.map(row => row.player_id)
    const grossSum = selectedRows.reduce(
      (acc, row) => acc + row.gross,
      0,
    )

    setData(prev => {
      return uniqBy(
        prev.map(row =>
          ids.includes(row.player_id)
            ? {
                ...row,
                player_id: ids,
                gross: grossSum,
                net:
                  grossSum <= 0
                    ? grossSum
                    : Math.floor(grossSum * 0.95),
              }
            : row,
        ),
        'player_id',
      )
    })

    setSelectedRows([])
  }

  const handleRevert = () => {
    setData(originData)
  }

  return (
    <div className="container">
      <div className="ultilities">
        <div className="functionalities">
          <FileUpload onDataParsed={handleDataParsed} />
          {data.length > 0 ? (
            <button
              disabled={selectedRows.length <= 1}
              className="btn btn-merge"
              onClick={handleMergeRows}>
              Merge
            </button>
          ) : null}
          {data.length > 0 ? (
            <button
              disabled={isEqual(data, originData)}
              className="btn btn-revert"
              onClick={handleRevert}>
              Revert
            </button>
          ) : null}
        </div>
        <div className="fund">
          <span
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: '#0F9D58',
            }}>
            Fund:{' '}
          </span>
          <span
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: '#0F9D58',
            }}>
            +{addToFund}
          </span>
        </div>
      </div>
      {data.length > 0 ? (
        <div
          style={{ width: 800 }}
          className="ag-theme-quartz">
          <AgGridReact
            rowData={data}
            columnDefs={colDefs}
            selection={selection}
            onSelectionChanged={handleSelect}
            onGridReady={onGridReady}
            gridOptions={gridOptions}
          />
        </div>
      ) : (
        <NoDataComponent />
      )}
    </div>
  )
}
