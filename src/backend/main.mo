import Map "mo:core/Map";
import Float "mo:core/Float";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Order "mo:core/Order";



actor {
  type PathologyTest = {
    id : Nat;
    name : Text;
    category : Text;
    mrp : Float;
    b2bRate : Float;
  };

  module PathologyTest {
    public func compare(test1 : PathologyTest, test2 : PathologyTest) : Order.Order {
      switch (Text.compare(test1.category, test2.category)) {
        case (#equal) { Text.compare(test1.name, test2.name) };
        case (order) { order };
      };
    };
  };

  type Lab = {
    id : Nat;
    name : Text;
    contact : Text;
  };

  module Lab {
    public func compare(lab1 : Lab, lab2 : Lab) : Order.Order {
      Text.compare(lab1.name, lab2.name);
    };
  };

  type SubAccount = {
    id : Nat;
    name : Text;
    phone : Text;
    pin : Text;
    labId : ?Nat;
  };

  module SubAccount {
    public func compare(acc1 : SubAccount, acc2 : SubAccount) : Order.Order {
      Text.compare(acc1.name, acc2.name);
    };
  };

  type SubAccountRate = {
    subAccountId : Nat;
    testId : Nat;
    b2bRate : Float;
  };

  type Transaction = {
    id : Nat;
    subAccountId : Nat;
    patientName : Text;
    date : Text;
    testIds : [Nat];
    totalAmount : Float;
    paidAmount : Float;
    dueAmount : Float;
    notes : Text;
  };

  let testStore = Map.empty<Nat, PathologyTest>();
  let labStore = Map.empty<Nat, Lab>();
  let subAccountStore = Map.empty<Nat, SubAccount>();
  let subAccountRates = Map.empty<Text, SubAccountRate>();
  let transactionStore = Map.empty<Nat, Transaction>();

  var nextTestId = 1;
  var nextLabId = 1;
  var nextSubAccountId = 1;
  var nextTransactionId = 1;

  let adminUsername = "Arit";
  let adminPassword = "12345";
  var adminSession : ?Text = null;

  // ADMIN AUTH
  public shared ({ caller }) func adminLogin(username : Text, password : Text) : async Text {
    if (username != adminUsername or password != adminPassword) {
      Runtime.trap("Invalid credentials. ");
    };
    let sessionToken = "admin-session-token-x" # username;
    adminSession := ?sessionToken;
    sessionToken;
  };

  public shared ({ caller }) func adminLogout() : async () {
    adminSession := null;
  };

  func validateAdminSession(token : Text) {
    switch (adminSession) {
      case (?storedToken) {
        if (storedToken != token) { Runtime.trap("Invalid session token") };
      };
      case (null) { Runtime.trap("No active session") };
    };
  };

  // PATHOLOGY TESTS
  public shared ({ caller }) func addPathologyTest(
    sessionToken : Text,
    name : Text,
    category : Text,
    mrp : Float,
    b2bRate : Float,
  ) : async Nat {
    validateAdminSession(sessionToken);
    let test : PathologyTest = {
      id = nextTestId;
      name;
      category;
      mrp;
      b2bRate;
    };
    testStore.add(nextTestId, test);
    nextTestId += 1;
    test.id;
  };

  public shared ({ caller }) func updatePathologyTest(
    sessionToken : Text,
    id : Nat,
    name : Text,
    category : Text,
    mrp : Float,
    b2bRate : Float,
  ) : async () {
    validateAdminSession(sessionToken);
    switch (testStore.get(id)) {
      case (null) { Runtime.trap("Test not found") };
      case (?_) {
        let updatedTest : PathologyTest = {
          id;
          name;
          category;
          mrp;
          b2bRate;
        };
        testStore.add(id, updatedTest);
      };
    };
  };

  public shared ({ caller }) func deletePathologyTest(sessionToken : Text, id : Nat) : async () {
    validateAdminSession(sessionToken);
    if (not testStore.containsKey(id)) {
      Runtime.trap("Test not found");
    };
    testStore.remove(id);

    var keysToRemove : [Text] = [];
    for ((key, rate) in subAccountRates.entries()) {
      if (rate.testId == id) {
        keysToRemove := keysToRemove.concat([key]);
      };
    };
    for (key in keysToRemove.values()) {
      subAccountRates.remove(key);
    };
  };

  public query ({ caller }) func getAllTests() : async [PathologyTest] {
    testStore.values().toArray().sort();
  };

  public query ({ caller }) func getTotalTestCount() : async Nat {
    testStore.size();
  };

  public shared ({ caller }) func addSampleData() : async () {
    let sampleTests = [
      {
        id = 1;
        name = "Complete Blood Count";
        category = "Blood Tests";
        mrp = 500.0;
        b2bRate = 200.0;
      },
      {
        id = 2;
        name = "Liver Function Test";
        category = "Liver Function";
        mrp = 1000.0;
        b2bRate = 400.0;
      },
      {
        id = 3;
        name = "Kidney Function Test";
        category = "Kidney Function";
        mrp = 1200.0;
        b2bRate = 500.0;
      },
      {
        id = 4;
        name = "Thyroid Profile";
        category = "Thyroid";
        mrp = 800.0;
        b2bRate = 350.0;
      },
      {
        id = 5;
        name = "Lipid Profile";
        category = "Lipid Profile";
        mrp = 900.0;
        b2bRate = 400.0;
      },
      {
        id = 6;
        name = "Blood Sugar Fasting";
        category = "Diabetes";
        mrp = 300.0;
        b2bRate = 100.0;
      },
      {
        id = 7;
        name = "Urine Routine";
        category = "Urine Tests";
        mrp = 400.0;
        b2bRate = 150.0;
      },
      {
        id = 8;
        name = "Serum Creatinine";
        category = "Kidney Function";
        mrp = 350.0;
        b2bRate = 120.0;
      },
      {
        id = 9;
        name = "HbA1c";
        category = "Diabetes";
        mrp = 800.0;
        b2bRate = 300.0;
      },
      {
        id = 10;
        name = "Vitamin D";
        category = "Blood Tests";
        mrp = 1500.0;
        b2bRate = 600.0;
      },
      {
        id = 11;
        name = "Calcium";
        category = "Blood Tests";
        mrp = 400.0;
        b2bRate = 150.0;
      },
      {
        id = 12;
        name = "SGPT";
        category = "Liver Function";
        mrp = 500.0;
        b2bRate = 200.0;
      },
      {
        id = 13;
        name = "TSH";
        category = "Thyroid";
        mrp = 600.0;
        b2bRate = 250.0;
      },
      {
        id = 14;
        name = "HDL Cholesterol";
        category = "Lipid Profile";
        mrp = 700.0;
        b2bRate = 300.0;
      },
      {
        id = 15;
        name = "Urine Microalbumin";
        category = "Urine Tests";
        mrp = 1000.0;
        b2bRate = 400.0;
      },
    ];
    for (test in sampleTests.values()) {
      testStore.add(test.id, test);
      if (test.id >= nextTestId) {
        nextTestId := test.id + 1;
      };
    };
  };

  // LABS
  public shared ({ caller }) func createLab(sessionToken : Text, name : Text, contact : Text) : async Nat {
    validateAdminSession(sessionToken);
    let lab : Lab = {
      id = nextLabId;
      name;
      contact;
    };
    labStore.add(nextLabId, lab);
    nextLabId += 1;
    lab.id;
  };

  public shared ({ caller }) func updateLab(sessionToken : Text, id : Nat, name : Text, contact : Text) : async () {
    validateAdminSession(sessionToken);
    switch (labStore.get(id)) {
      case (null) { Runtime.trap("Lab not found") };
      case (?_) {
        let updatedLab : Lab = {
          id;
          name;
          contact;
        };
        labStore.add(id, updatedLab);
      };
    };
  };

  public shared ({ caller }) func deleteLab(sessionToken : Text, id : Nat) : async () {
    validateAdminSession(sessionToken);
    if (not labStore.containsKey(id)) {
      Runtime.trap("Lab not found");
    };
    labStore.remove(id);
  };

  public query ({ caller }) func getAllLabs() : async [Lab] {
    labStore.values().toArray().sort();
  };

  // SUBACCOUNTS
  public shared ({ caller }) func createSubAccount(
    sessionToken : Text,
    name : Text,
    phone : Text,
    pin : Text,
    labId : ?Nat,
  ) : async Nat {
    validateAdminSession(sessionToken);

    switch (labId) {
      case (?labId) {
        if (not labStore.containsKey(labId)) {
          Runtime.trap("Lab does not exist");
        };
      };
      case (null) {};
    };

    let subAccount : SubAccount = {
      id = nextSubAccountId;
      name;
      phone;
      pin;
      labId;
    };
    subAccountStore.add(nextSubAccountId, subAccount);
    nextSubAccountId += 1;
    subAccount.id;
  };

  public shared ({ caller }) func updateSubAccount(
    sessionToken : Text,
    id : Nat,
    name : Text,
    phone : Text,
    pin : Text,
    labId : ?Nat,
  ) : async () {
    validateAdminSession(sessionToken);

    switch (labId) {
      case (?labId) {
        if (not labStore.containsKey(labId)) {
          Runtime.trap("Lab does not exist");
        };
      };
      case (null) {};
    };

    switch (subAccountStore.get(id)) {
      case (null) { Runtime.trap("Subaccount not found") };
      case (?_) {
        let updatedSubAccount : SubAccount = {
          id;
          name;
          phone;
          pin;
          labId;
        };
        subAccountStore.add(id, updatedSubAccount);
      };
    };
  };

  public shared ({ caller }) func deleteSubAccount(sessionToken : Text, id : Nat) : async () {
    validateAdminSession(sessionToken);
    if (not subAccountStore.containsKey(id)) {
      Runtime.trap("Subaccount not found");
    };
    subAccountStore.remove(id);

    var keysToRemove : [Text] = [];
    for ((key, rate) in subAccountRates.entries()) {
      if (rate.subAccountId == id) {
        keysToRemove := keysToRemove.concat([key]);
      };
    };
    for (key in keysToRemove.values()) {
      subAccountRates.remove(key);
    };
  };

  public query ({ caller }) func getAllSubAccounts(sessionToken : Text) : async [SubAccount] {
    validateAdminSession(sessionToken);
    subAccountStore.values().toArray().sort();
  };

  public query ({ caller }) func getTotalSubAccountCount() : async Nat {
    subAccountStore.size();
  };

  public query ({ caller }) func getSubAccountById(subAccountId : Nat) : async ?SubAccount {
    subAccountStore.get(subAccountId);
  };

  // SubAccount Pin Verification
  public query ({ caller }) func verifySubAccountPin(subAccountId : Nat, pin : Text) : async Bool {
    switch (subAccountStore.get(subAccountId)) {
      case (?subAccount) {
        subAccount.pin == pin;
      };
      case (null) { false };
    };
  };

  // PER-SUBACCOUNT TEST RATES
  public shared ({ caller }) func setSubAccountTestRate(
    sessionToken : Text,
    subAccountId : Nat,
    testId : Nat,
    b2bRate : Float,
  ) : async () {
    validateAdminSession(sessionToken);

    if (not subAccountStore.containsKey(subAccountId)) {
      Runtime.trap("Subaccount does not exist");
    };

    if (not testStore.containsKey(testId)) {
      Runtime.trap("Test does not exist");
    };

    let rate : SubAccountRate = {
      subAccountId;
      testId;
      b2bRate;
    };
    let key = subAccountId.toText() # ":" # testId.toText();
    subAccountRates.add(key, rate);
  };

  public shared ({ caller }) func deleteSubAccountTestRate(
    sessionToken : Text,
    subAccountId : Nat,
    testId : Nat,
  ) : async () {
    validateAdminSession(sessionToken);
    let key = subAccountId.toText() # ":" # testId.toText();
    if (not subAccountRates.containsKey(key)) {
      Runtime.trap("Rate override does not exist");
    };
    subAccountRates.remove(key);
  };

  public query ({ caller }) func getSubAccountRates(subAccountId : Nat) : async [SubAccountRate] {
    let filtered = subAccountRates.values().toArray().filter(
      func(rate) { rate.subAccountId == subAccountId }
    );
    filtered;
  };

  // TRANSACTIONS
  public shared ({ caller }) func addTransaction(
    sessionToken : Text,
    subAccountId : Nat,
    patientName : Text,
    date : Text,
    testIds : [Nat],
    paidAmount : Float,
    notes : Text,
  ) : async Nat {
    validateAdminSession(sessionToken);

    if (not subAccountStore.containsKey(subAccountId)) {
      Runtime.trap("Subaccount does not exist");
    };

    // Calculate total amount
    var totalAmount : Float = 0.0;
    for (testId in testIds.values()) {
      switch (testStore.get(testId)) {
        case (?test) {
          // Check for sub-account specific rate
          let rateKey = subAccountId.toText() # ":" # testId.toText();
          switch (subAccountRates.get(rateKey)) {
            case (?rate) {
              totalAmount += rate.b2bRate;
            };
            case (null) {
              totalAmount += test.b2bRate;
            };
          };
        };
        case (null) { Runtime.trap("Test with id " # testId.toText() # " not found") };
      };
    };

    let dueAmount = totalAmount - paidAmount;

    let transaction : Transaction = {
      id = nextTransactionId;
      subAccountId;
      patientName;
      date;
      testIds;
      totalAmount;
      paidAmount;
      dueAmount;
      notes;
    };
    transactionStore.add(nextTransactionId, transaction);
    nextTransactionId += 1;
    transaction.id;
  };

  public shared ({ caller }) func updateTransactionPaid(
    sessionToken : Text,
    transactionId : Nat,
    paidAmount : Float,
  ) : async () {
    validateAdminSession(sessionToken);
    switch (transactionStore.get(transactionId)) {
      case (null) { Runtime.trap("Transaction not found") };
      case (?transaction) {
        let dueAmount = transaction.totalAmount - paidAmount;
        let updatedTransaction : Transaction = {
          transaction with
          paidAmount;
          dueAmount;
        };
        transactionStore.add(transactionId, updatedTransaction);
      };
    };
  };

  public shared ({ caller }) func deleteTransaction(sessionToken : Text, transactionId : Nat) : async () {
    validateAdminSession(sessionToken);
    if (not transactionStore.containsKey(transactionId)) {
      Runtime.trap("Transaction not found");
    };
    transactionStore.remove(transactionId);
  };

  public shared ({ caller }) func getAllTransactions(sessionToken : Text) : async [Transaction] {
    validateAdminSession(sessionToken);
    transactionStore.values().toArray();
  };

  public query ({ caller }) func getSubAccountTransactions(subAccountId : Nat, pin : Text) : async [Transaction] {
    switch (subAccountStore.get(subAccountId)) {
      case (?subAccount) {
        if (subAccount.pin != pin) {
          Runtime.trap("Invalid pin");
        };
        let filtered = transactionStore.values().toArray().filter(
          func(transaction) { transaction.subAccountId == subAccountId }
        );
        filtered;
      };
      case (null) { Runtime.trap("Subaccount not found") };
    };
  };
};
