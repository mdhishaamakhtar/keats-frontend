import React, { useState, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { useParams, Link, Redirect } from 'react-router-dom'
import { MdComment } from 'react-icons/md'
import { getClub } from './../utils/apiCalls'
import Loader from './../components/Loader'
import './../styles/Read.css'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

interface ClubProps {
  id: string
  clubname: string
  club_pic: string
  file_url: string
  page_no: number
  private: boolean
  page_sync: boolean
  host_id: string
  host_name: string
  host_profile_pic: string
}

const Read: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [club, setClub] = useState<ClubProps>({
    id: id,
    clubname: '',
    club_pic: '',
    file_url: '',
    page_no: 0,
    private: false,
    page_sync: false,
    host_id: '',
    host_name: '',
    host_profile_pic: ''
  })
  const [redirect, setRedirect] = useState(false)
  const [device, setDevice] = useState('')
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const getDeets = async (): Promise<void> => {
      const { exists, club }: { exists: boolean, club: any } = await getClub(id)
      if (!exists) {
        setRedirect(!exists)
        return
      }
      setClub(club)
    }
    getDeets().then(() => { }, () => { })
  }, [id])

  const checkDevice = (): string => {
    if (window.innerWidth < 768) return 'phone'
    else if (window.innerWidth < 1200) return 'tablet'
    else return 'desktop'
  }

  useEffect(() => {
    window.addEventListener('load', () => { setDevice(checkDevice()); setWidth(window.innerWidth) })
    window.addEventListener('resize', () => { setDevice(checkDevice()); setWidth(window.innerWidth) })
  })

  useEffect(() => {
    setDevice(checkDevice())
    setWidth(window.innerWidth)
  }, [])

  // PDF.js ka nakhra
  const [numPages, setNumPages] = useState(0)
  const [pageNumber, setPageNumber] = useState(1)

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }): void => {
    setNumPages(numPages)
    setPageNumber(1)
  }

  const changePage = (offset: number): void => {
    setPageNumber(prevPageNumber => prevPageNumber + offset)
  }

  const previousPage = (): void => {
    changePage(-1)
  }

  const nextPage = (): void => {
    changePage(1)
  }

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
    <>
      {
        redirect
          ? <Redirect to='/clubs' />
          : club.file_url === ''
            ? <section className='clubp-loader'><Loader /></section>
            /* eslint-disable  @typescript-eslint/indent */
            /* eslint-disable  react/jsx-indent */
            : <>
                <section>
                  <div className='clubs-header'>
                    <h2><Link to={`/club/${id}`}>{club.clubname}</Link></h2>
                    <div className='clubp-icons'>
                      <div>
                        <Link to={`/club/${id}/comments`}>
                          <MdComment />
                        </Link>
                      </div>
                    </div>
                  </div>

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
                        file={`${club.file_url}`}
                        onLoadSuccess={onDocumentLoadSuccess}
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
                </section>
              </>
            /* eslint-enable  @typescript-eslint/indent */
            /* eslint-enable  react/jsx-indent */
      }
    </>
  )
}

export default Read
