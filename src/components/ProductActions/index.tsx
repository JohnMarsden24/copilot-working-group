import { useProduct } from '../../hooks/useProduct';
import { useCartContext } from '../../contexts';
import { Button } from '../ui/Button';
import styles from './ProductActions.module.css';

export const ProductActions = () => {
  const { data: product } = useProduct();
  const { addToCart } = useCartContext();

  return (
    <div className={styles.actions}>
      <Button fullWidth onClick={() => product && addToCart(product)}>
        Add to Cart
      </Button>
    </div>
  );
};
