import { Link } from '@tanstack/react-router';
import { useCartContext } from '../../contexts';
import styles from './Header.module.css';

export const Header = () => {
  const { totalItems } = useCartContext();

  return (
    <div className={styles.header}>
      <div className={styles.topBar}>
        <div className={styles.leftSection}>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoIcon}>🛍️</span>
            <span className={styles.logoText}>ShopHub</span>
          </Link>

          <div className={styles.searchSection}>
            <div className={styles.searchBar}>
              <input
                type="search"
                placeholder="Search everything at ShopHub online and in store"
                className={styles.searchInput}
              />
              <button className={styles.searchButton} aria-label="Search">
                🔍
              </button>
            </div>
          </div>
        </div>

        <div className={styles.rightSection}>
          <nav className={styles.utilityNav}>
            <button className={styles.navItem} aria-label="Account">
              <span className={styles.navIcon}>👤</span>
              <span className={styles.navLabel}>Account</span>
            </button>

            <button className={styles.navItem} aria-label="Reorder">
              <span className={styles.navIcon}>🔄</span>
              <span className={styles.navLabel}>Reorder</span>
            </button>

            <button className={styles.navItem} aria-label="Favorites">
              <span className={styles.navIcon}>❤️</span>
              <span className={styles.navLabel}>Favorites</span>
            </button>
          </nav>

          <button className={styles.cart} aria-label="Shopping cart">
            <span className={styles.cartIcon}>🛒</span>
            <span className={styles.cartLabel}>Cart</span>
            {totalItems > 0 && (
              <span className={styles.cartCount}>{totalItems}</span>
            )}
          </button>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <button className={styles.departmentsButton}>
          <span>☰</span>
          <span>All Departments</span>
        </button>

        <nav className={styles.navLinks}>
          <Link to="/" className={styles.navLink}>
            Flash Deals
          </Link>
          <Link to="/" className={styles.navLink}>
            Grocery & Essentials
          </Link>
          <Link to="/" className={styles.navLink}>
            Holiday Gifts
          </Link>
          <Link to="/" className={styles.navLink}>
            Home
          </Link>
          <Link to="/" className={styles.navLink}>
            Fashion
          </Link>
          <Link to="/" className={styles.navLink}>
            Electronics
          </Link>
          <Link to="/" className={styles.navLink}>
            Toys
          </Link>
        </nav>
      </div>
    </div>
  );
};
