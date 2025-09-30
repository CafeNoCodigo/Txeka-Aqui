import { socialImgs } from '../../constants/index'
const Footer = () => {
  return (
    <div>
        <footer className='relative w-full h-25 bg-white'>
            <div className='flex flex-col items-center justify-center h-full text-white gap-1'>
              <p className='text-sm text-black'>© {new Date().getFullYear()} InvoiceUp System. All rights reserved.</p>
              <p className='text-xs text-black'>Made with 💚 by Fabião Chirindza Mainato</p>
              <div className="flex gap-5">
                {socialImgs.map((item) => 
                  <a 
                    key={item.name}
                    href={item.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    >
                      <img className='media-logo' src={item.imgPath} alt={item.name} />
                    </a>
                  )}
              </div>
            </div>
        </footer>
    </div>
  )
}

export default Footer