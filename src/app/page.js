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
            backgroundColor: '#73EC8B',
            color: 'white',
            fontWeight: 'bold',
          }
        } else {
          return {
            backgroundColor: '#FF885B',
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
        <FileUpload onDataParsed={handleDataParsed} />
        <div>
          <button
            disabled={selectedRows.length <= 1}
            className="btn btn-merge"
            onClick={handleMergeRows}>
            Merge
          </button>
        </div>
        <div>
          <button
            disabled={isEqual(data, originData)}
            className="btn btn-revert"
            onClick={handleRevert}>
            Revert
          </button>
        </div>
        <div>
          <span
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: '#3A6D8C',
            }}>
            Fund:{' '}
          </span>
          <span
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: '#4379F2',
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
