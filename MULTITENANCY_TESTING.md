# Multitenancy Testing Guide

## 🎯 Overview

Your ChamaSmart database has been seeded with **3 separate chamas**, each with their own users, transactions, loans, and assets. This allows you to thoroughly test the multitenancy isolation.

## 📊 Test Data Summary

### Chama 1: Sunrise Investment Group
- **4 Users**: 1 Admin, 1 Treasurer, 2 Members
- **4 Transactions**: KES 10,000 each (Total: KES 40,000)
- **1 Loan**: KES 50,000 (APPROVED) with 2 guarantors
- **1 Asset**: Land in Kiambu (KES 950,000 current value)

### Chama 2: Unity Savings Group
- **3 Users**: 1 Admin, 2 Members
- **3 Transactions**: KES 5,000 each (Total: KES 15,000)
- **0 Loans**
- **1 Asset**: Treasury Bonds (KES 215,000 current value)

### Chama 3: Prosperity Chama
- **5 Users**: 1 Admin, 1 Treasurer, 3 Members
- **6 Transactions**: 5x KES 15,000 + 1x KES 2,000 expense (Total: KES 73,000)
- **2 Loans**: KES 30,000 (APPROVED) + KES 40,000 (PENDING)
- **2 Assets**: Rental Apartment (KES 4.2M) + SACCO Shares (KES 165,000)

---

## 🔐 Test Credentials

### Chama 1: Sunrise Investment Group
```
Admin:     admin@sunrise.com / password123
Treasurer: treasurer@sunrise.com / password123
Member:    john@sunrise.com / password123
Member:    mary@sunrise.com / password123
```

### Chama 2: Unity Savings Group
```
Admin:  admin@unity.com / password123
Member: alice@unity.com / password123
Member: bob@unity.com / password123
```

### Chama 3: Prosperity Chama
```
Admin:     admin@prosperity.com / password123
Treasurer: treasurer@prosperity.com / password123
Member:    jane@prosperity.com / password123
Member:    tom@prosperity.com / password123
Member:    lucy@prosperity.com / password123
```

---

## 🧪 Multitenancy Test Scenarios

### Test 1: Data Isolation
**Objective**: Verify users only see their own chama's data

1. Login as `admin@sunrise.com`
2. Navigate to Dashboard
3. **Expected**: See 4 members, KES 40,000 in transactions, 1 loan, 1 asset
4. Logout and login as `admin@unity.com`
5. **Expected**: See 3 members, KES 15,000 in transactions, 0 loans, 1 asset
6. **Verify**: No data from Sunrise Investment Group is visible

### Test 2: Member List Isolation
**Objective**: Ensure member lists are filtered by chama

1. Login as `admin@sunrise.com`
2. Go to Members page
3. **Expected**: See only 4 members (James, Grace, John, Mary)
4. Logout and login as `admin@prosperity.com`
5. Go to Members page
6. **Expected**: See only 5 members (Sarah, David, Jane, Tom, Lucy)
7. **Verify**: No members from other chamas appear

### Test 3: Transaction Filtering
**Objective**: Transactions are scoped to user's chama

1. Login as `treasurer@sunrise.com`
2. Go to Wallet/Transactions page
3. **Expected**: See 4 transactions totaling KES 40,000
4. **Verify**: All transactions belong to Sunrise members
5. Logout and login as `admin@unity.com`
6. **Expected**: See 3 transactions totaling KES 15,000
7. **Verify**: No Sunrise transactions visible

### Test 4: Loan Guarantor Workflow
**Objective**: Loan guarantors must be from same chama

1. Login as `john@sunrise.com` (borrower)
2. View Loans page
3. **Expected**: See 1 approved loan for KES 50,000
4. **Verify**: Guarantors are James (Admin) and Grace (Treasurer) from same chama
5. Login as `jane@prosperity.com`
6. **Expected**: See 1 approved loan for KES 30,000
7. **Verify**: Guarantors are from Prosperity Chama only

### Test 5: Asset Visibility
**Objective**: Assets are only visible to chama members

1. Login as `admin@sunrise.com`
2. Go to Investments page
3. **Expected**: See 1 asset (Land in Kiambu - KES 950,000)
4. Logout and login as `admin@prosperity.com`
5. **Expected**: See 2 assets (Rental Apartment + SACCO Shares)
6. **Verify**: Sunrise's land asset is NOT visible

### Test 6: Cross-Chama Operations (Should Fail)
**Objective**: Users cannot perform operations on other chamas' data

1. Login as `admin@sunrise.com`
2. Try to access a member ID from Unity Savings Group (if possible via URL manipulation)
3. **Expected**: Access denied or 404 error
4. Try to view a transaction from Prosperity Chama
5. **Expected**: Not visible or access denied

### Test 7: Role-Based Access
**Objective**: Verify role permissions within same chama

1. Login as `john@sunrise.com` (MEMBER)
2. **Expected**: Can view own transactions and loans
3. **Expected**: Cannot add/remove members (Admin only)
4. Login as `treasurer@sunrise.com` (TREASURER)
5. **Expected**: Can manage transactions
6. **Expected**: Can approve loans
7. Login as `admin@sunrise.com` (ADMIN)
8. **Expected**: Full access to all chama features

### Test 8: Dashboard Statistics
**Objective**: Dashboard shows correct chama-specific stats

1. Login as `admin@sunrise.com`
2. View Dashboard
3. **Expected Stats**:
   - Total Members: 4
   - Total Contributions: KES 40,000
   - Active Loans: 1
   - Total Assets: KES 950,000
4. Login as `admin@prosperity.com`
5. **Expected Stats**:
   - Total Members: 5
   - Total Contributions: KES 73,000
   - Active Loans: 2
   - Total Assets: KES 4,365,000

### Test 9: Loan Approval Workflow
**Objective**: Test pending loan approval within chama

1. Login as `tom@prosperity.com`
2. View Loans page
3. **Expected**: See 1 pending loan for KES 40,000
4. **Expected**: See guarantor status (1 pending, 1 approved)
5. Login as `treasurer@prosperity.com` (guarantor)
6. Approve the guarantee
7. **Expected**: Loan status updates

### Test 10: New Member Registration
**Objective**: New members are added to correct chama

1. Login as `admin@sunrise.com`
2. Add a new member
3. **Expected**: New member gets `chamaId` of Sunrise Investment Group
4. Logout and login with new member credentials
5. **Expected**: See only Sunrise data
6. **Verify**: Cannot see Unity or Prosperity data

---

## 🛠️ Database Management Commands

```bash
# Clear all data and start fresh
npm run clear-db

# Seed database with test data
npm run seed

# Clear and reseed in one go
npm run clear-db && npm run seed
```

---

## 🔍 What to Look For

### ✅ Expected Behavior
- Users only see data from their own chama
- Member lists are filtered by chamaId
- Transactions show only chama members
- Loans and guarantors are within same chama
- Assets are chama-specific
- Dashboard stats are accurate per chama
- Role permissions work correctly

### ❌ Red Flags (Bugs to Fix)
- Seeing members from other chamas
- Transactions from other chamas visible
- Cross-chama loan guarantors
- Assets from other chamas appearing
- Incorrect dashboard statistics
- Ability to access other chamas' data via URL manipulation
- Missing chamaId filters in queries

---

## 📝 Testing Checklist

- [ ] Test 1: Data Isolation
- [ ] Test 2: Member List Isolation
- [ ] Test 3: Transaction Filtering
- [ ] Test 4: Loan Guarantor Workflow
- [ ] Test 5: Asset Visibility
- [ ] Test 6: Cross-Chama Operations
- [ ] Test 7: Role-Based Access
- [ ] Test 8: Dashboard Statistics
- [ ] Test 9: Loan Approval Workflow
- [ ] Test 10: New Member Registration

---

## 🐛 Reporting Issues

If you find any multitenancy issues:

1. **Document the issue**:
   - Which chama were you logged in as?
   - What data was incorrectly visible?
   - Steps to reproduce

2. **Check the code**:
   - Are queries filtering by `user.chamaId`?
   - Are server actions checking chama membership?
   - Is middleware enforcing chama boundaries?

3. **Fix priority**:
   - **Critical**: Data leakage between chamas
   - **High**: Incorrect statistics or member lists
   - **Medium**: UI/UX issues within chama
   - **Low**: Cosmetic issues

---

## 🎯 Success Criteria

Your multitenancy implementation is successful if:

1. ✅ **Complete Data Isolation**: No chama can see another's data
2. ✅ **Correct Filtering**: All queries filter by chamaId
3. ✅ **Secure Operations**: Cross-chama operations are prevented
4. ✅ **Accurate Stats**: Dashboard shows correct chama-specific data
5. ✅ **Role Enforcement**: Permissions work within chama boundaries

---

**Happy Testing! 🚀**

Remember: The goal is to ensure that each chama operates as a completely isolated tenant with no data leakage between organizations.
