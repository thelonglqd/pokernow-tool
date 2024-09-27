// components/FileUpload.js
import { useState } from 'react'
import Papa from 'papaparse'
import { pick } from 'lodash'

const FileUpload = ({ onDataParsed }) => {
  const [file, setFile] = useState(null)

  const handleFileChange = event => {
    const uploadedFile = event.target.files[0]
    if (uploadedFile) {
      setFile(uploadedFile)
      parseCSV(uploadedFile)
    }
  }

  const parseCSV = file => {
    Papa.parse(file, {
      complete: results => {
        let final = []
        let picked = results.data
          .filter(
            row =>
              row.player_id &&
              row.player_nickname &&
              row.net,
          )
          .map(row =>
            pick(row, [
              'player_nickname',
              'player_id',
              'net',
            ]),
          )
          .map(row => ({
            ...row,
            player_nickname:
              row.player_nickname.toUpperCase(),
            gross: parseInt(row.net),
          }))
          .map(row =>
            parseInt(row.gross) <= 0
              ? { ...row, net: parseInt(row.gross) }
              : {
                  ...row,
                  net: Math.floor(
                    parseInt(row.gross) * 0.95,
                  ),
                },
          )

        for (let i = 0; i < picked.length; i++) {
          if (i === 0) {
            final.push(picked[0])
          } else {
            var sameNameOrId = final.find(
              data =>
                data.player_nickname ===
                  picked[i].player_nickname ||
                data.player_id === picked[i].player_id,
            )

            if (sameNameOrId) {
              final = final.map(data =>
                data.player_nickname ===
                  sameNameOrId.player_nickname ||
                data.player_id === sameNameOrId.player_id
                  ? {
                      ...sameNameOrId,
                      gross:
                        parseInt(sameNameOrId.gross) +
                        parseInt(picked[i].gross),
                      net:
                        parseInt(sameNameOrId.gross) +
                          parseInt(picked[i].gross) <=
                        0
                          ? parseInt(sameNameOrId.gross) +
                            parseInt(picked[i].gross)
                          : Math.floor(
                              (parseInt(
                                sameNameOrId.gross,
                              ) +
                                parseInt(picked[i].gross)) *
                                0.95,
                            ),
                    }
                  : data,
              )
            } else {
              final.push(picked[i])
            }
          }
        }

        onDataParsed(final)
      },
      header: true,
    })
  }

  return (
    <>
      <label
        htmlFor="file-upload"
        className="custom-file-upload">
        Select csv file
      </label>
      <input
        id="file-upload"
        type="file"
        accept=".csv"
        onChange={handleFileChange}
      />
    </>
  )
}

export default FileUpload
