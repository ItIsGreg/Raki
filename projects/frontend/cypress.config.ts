import { defineConfig } from "cypress";
import * as XLSX from 'xlsx'
import * as fs from 'fs'
import * as path from 'path'

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        readExcelRowCount(filePath) {
          const workbook = XLSX.readFile(filePath)
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
          const data = XLSX.utils.sheet_to_json(firstSheet)
          return data.length
        },
        deleteFile(filePath) {
          try {
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath)
            }
            return null
          } catch (error) {
            return null
          }
        },
        getDownloadedFiles() {
          const downloadsFolder = path.join(process.cwd(), 'cypress', 'downloads')
          if (!fs.existsSync(downloadsFolder)) {
            return []
          }
          return fs.readdirSync(downloadsFolder)
        },
        clearDownloads() {
          const downloadsFolder = path.join(process.cwd(), 'cypress', 'downloads')
          if (fs.existsSync(downloadsFolder)) {
            const files = fs.readdirSync(downloadsFolder)
            files.forEach(file => {
              const filePath = path.join(downloadsFolder, file)
              if (fs.statSync(filePath).isFile()) {
                fs.unlinkSync(filePath)
              }
            })
          }
          return null
        },
        copyDownloadToFixtures({ fileName }) {
          const downloadsFolder = path.join(process.cwd(), 'cypress', 'downloads')
          const fixturesFolder = path.join(process.cwd(), 'cypress', 'fixtures')
          const src = path.join(downloadsFolder, fileName)
          const dest = path.join(fixturesFolder, fileName)
          fs.copyFileSync(src, dest)
          return null
        },
        deleteFileIfExists(filePath) {
          const fullPath = path.join(process.cwd(), filePath)
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath)
          }
          return null
        },
      })
    },
    downloadsFolder: 'cypress/downloads',
    chromeWebSecurity: false,
  },
})