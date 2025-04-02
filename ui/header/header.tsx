import styles from './header.module.scss';
import logo from '../../public/logo.svg'
import Image from 'next/image';

export const Header = () => {
    return <header className={styles.header}>
        <div id={styles.logo}>
            <Image src={logo} alt='logo' width={32} height={32}/>
            <strong>ShadMen</strong>
        </div>
        <select 
            name="lang" 
            id="lang"
            className="px-2 bg-white text-black dark:bg-background dark:text-white border-none outline-none appearance-none"
          >
            <option value="eng" className={styles.option} selected>eng</option>
            <option value="rus" className={styles.option}>rus</option>
        </select>
        <div className={styles.action}>
            <button type='button' className='p-2 border-1 bg-white text-black dark:bg-background dark:text-white hover:scale-110 transition-transform duration-200'>Sign In</button>
            <button type='button' className='p-2 border-1 bg-white text-black dark:bg-background dark:text-white hover:scale-110 transition-transform duration-200'>Sign Up</button>
        </div>
    </header>
}