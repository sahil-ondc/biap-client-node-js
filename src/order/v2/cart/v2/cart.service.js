import Cart from '../../db/cart.js'
import CartItem from '../../db/items.js'

class CartService {

    async addItem(data) {
        try {

            console.log("data----",data.userId == 'undefined',data);
            let cart ={}
            if (data.userId == 'undefined') 
              cart = await Cart.findOne({ipAddress:data.ipAddress});
           else {
                cart = await Cart.findOne({userId:data.userId});
            }
            console.log("data----",data);
           if(cart){
               //add items to the cart

               let cartItem = new CartItem();
               cartItem.cart=cart._id;
               cartItem.item =data;
              return  await cartItem.save();
           }else{
               //create a new cart
               let cart ={}
               if (data.userId == 'undefined') 
               cart = await new Cart({ipAddress:data.ipAddress}).save();
            else {
                 cart =await new Cart({userId:data.userId}).save()
            }
               let cartItem = new CartItem();
               cartItem.cart=cart._id;
               cartItem.item =data;
               return  await cartItem.save();
           }

        }
        catch (err) {
            throw err;
        }
    }

    async updateItem(data) {
        try {

                let cartItem = await CartItem.findOne({_id:data.itemId});
                cartItem.item =data;
                return  await cartItem.save();

        }
        catch (err) {
            throw err;
        }
    }

    async removeItem(data) {
        try {
            return  await CartItem.deleteOne({_id:data.itemId});
        }
        catch (err) {
            throw err;
        }
    }

    async clearCart(data) {
        try {
            const cart = await Cart.findOne({userId:data.userId})
            return  await CartItem.deleteMany({cart:cart?._id});
        }
        catch (err) {
            throw err;
        }
    }

    // async getCartItem(data) {
    //     try {
            
    //         const cart = await Cart.findOne({userId:data.userId})
    //         if(cart){
    //             return  await CartItem.find({cart:cart._id});
    //         }else{
    //             return  []
    //         }

    //     }
    //     catch (err) {
    //         throw err;
    //     }
    // }
    async getCartItem(data) {
        try {
            let cart ={}
            let cart2=false
            if (data.userId == 'undefined') 
              cart = await Cart.findOne({ipAddress:data.ipAddress});
           else {
                cart = await Cart.findOne({userId:data.userId});
                cart2 = await Cart.findOne({ipAddress:data.ipAddress});
                console.log('jatinder cart',cart,'cart2',cart2)
            }

            let cart1Item;
            let newCart = [];
            console.log(`cart: ${cart}`)
            if(cart){
               cart1Item =  await CartItem.find({cart:cart._id});
               newCart= [...cart1Item]
               console.log(`cartItem: ${cart1Item} ${newCart}`)
            }

            if(cart2){
                let cart2Item = await CartItem.find({cart:cart2._id});
                newCart =[...cart1Item,...cart2Item];
                // await CartItem.updateOne({cart:cart._id},{ $set: { item: newCart }});
                // await Cart.deleteOne({ ipAddress: data.ipAddress });
            }

            return newCart;

        }
        catch (err) {
            throw err;
        }
    }

}

export default CartService;
