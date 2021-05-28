import React, { useState, useEffect, useCallback } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import Loader from './../components/Loader'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

interface Props {
  url: string
  setPdf: React.Dispatch<React.SetStateAction<boolean>>
}

const Pdf: React.FC<Props> = ({ url, setPdf }) => {
  const [device, setDevice] = useState('')
  const [width, setWidth] = useState(0)

  const checkDevice = (): string => {
    if (window.innerWidth < 768) return 'phone'
    else if (window.innerWidth < 1200) return 'tablet'
    else return 'desktop'
  }

  useEffect(() => {
    window.addEventListener('load', () => {
      setDevice(checkDevice())
      setWidth(window.innerWidth)
    })

    window.addEventListener('resize', () => {
      setDevice(checkDevice())
      setWidth(window.innerWidth)
      removeTextLayerOffset()
    })
  })

  useEffect(() => {
    setDevice(checkDevice())
    setWidth(window.innerWidth)
    return () => {
      setDevice(checkDevice())
      setWidth(window.innerWidth)
    }
  }, [])

  // PDF.js ka nakhra
  const [numPages, setNumPages] = useState(0)
  const [pageNumber, setPageNumber] = useState(1)

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }): void => {
    setNumPages(numPages)
    setPageNumber(1)
  }

  const onDocumentError = (): JSX.Element => {
    setPdf(false)
    return <div>Not a PDF</div>
  }

  const changePage = (offset: number): void => {
    setPageNumber(prevPageNumber => prevPageNumber + offset)
  }

  const previousPage = useCallback(() => {
    if (pageNumber > 1) changePage(-1)
  }, [pageNumber])
  const nextPage = useCallback(() => {
    if (pageNumber < numPages) changePage(1)
  }, [pageNumber, numPages])

  const keyChangePage = useCallback((event) => {
    if (event.keyCode === 37) previousPage()
    else if (event.keyCode === 39) nextPage()
  }, [nextPage, previousPage])

  useEffect(() => {
    document.addEventListener('keydown', keyChangePage, false)

    return () => {
      document.removeEventListener('keydown', keyChangePage, false)
    }
  }, [keyChangePage])

  const removeTextLayerOffset = (): void => {
    const pageLayers = document.querySelectorAll('.react-pdf__Page')
    pageLayers.forEach(layer => {
      layer.setAttribute('style', 'position: relative; overflow: hidden;')
    })
    const textLayers = document.querySelectorAll('.react-pdf__Page__textContent')
    textLayers.forEach(layer => {
      layer.setAttribute('style', 'top: 0; left: 0; color: transparent; pointer-events: none;')
      // layer.setAttribute("style", "top:0; left:0; transform:\"\";")
      // const { style } = layer
      // style.top = "0"
      // style.left = "0"
      // style.transform = ""
    })
    const annotationLayers = document.querySelectorAll('.react-pdf__Page__annotations')
    annotationLayers.forEach(layer => {
      layer.setAttribute('style', 'display: none;')
    })
  }

  return (
    <div className='read'>
      {/* <a target='_blank' rel='noreferrer' href={club.file_url}>{club.file_url}</a> */}
      <div className='read-pageno'>
        <button
          className='read-pagenav'
          type='button'
          disabled={pageNumber <= 1}
          onClick={previousPage}
        >
          {'<'}
        </button>
        <p>{pageNumber !== 0 ? pageNumber : (numPages !== 0 ? 1 : '--')} / {numPages !== 0 ? numPages : '--'}
        </p>
        <button
          className='read-pagenav'
          type='button'
          disabled={pageNumber >= numPages}
          onClick={nextPage}
        >
          {'>'}
        </button>
      </div>
      <div>
        <Document
          file={url}
          loading={<Loader />}
          onLoadSuccess={onDocumentLoadSuccess}
          error={onDocumentError}
        >
          <div className='read-book'>
            <Page
              pageNumber={pageNumber}
              width={
                device !== 'desktop'
                  ? (width * 0.9)
                  : (800)
              }
              onLoadSuccess={removeTextLayerOffset}
            />
          </div>
        </Document>
      </div>
    </div>
  )
}

export default Pdf
