const navigation = () => {
  return [
    {
      title: 'Item',
      path: '/home',
      children: [
        {
          title: 'Add Item',
          path: '/home'
        },
        {
          title: 'View Items',
          path: '/home/view'
        }
      ]
    },
    {
      title: 'Supplier',
      path: '/supplier',
      children: [
        {
          title: 'Add Supplier',
          path: '/supplier'
        },
        {
          title: 'View Suppliers',
          path: '/supplier/view'
        }
      ]
    },
    {
      path: '/customer',
      title: 'Customer',
      children: [
        {
          title: 'Add Customer',
          path: '/customer'
        },
        {
          title: 'View Customers',
          path: '/customer/view'
        }
      ]
    },
    {
      path: '/purchase',
      title: 'Purchase',
      children: [
        {
          title: 'Add Purchase',
          path: '/purchase'
        },
        {
          title: 'View Purchases',
          path: '/purchase/view'
        }
      ]
    },
    {
      path: '/sale',
      title: 'Sale',
      children: [
        {
          title: 'Add Sale',
          path: '/sale'
        },
        {
          title: 'View Sale',
          path: '/sale/view'
        }
      ]
    },
    {
      path: '/voucher',
      title: 'Voucher',
      children: [
        {
          title: 'Cr. Voucher',
          path: '/voucher/cr_account'
        },
        {
          title: 'Db. Voucher',
          path: '/voucher/db_account'
        }
      ]
    },
  ]
}

export default navigation
