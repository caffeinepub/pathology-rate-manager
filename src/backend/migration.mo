import Map "mo:core/Map";
import Nat "mo:core/Nat";

module {
  type OldActor = {
    testStore : Map.Map<Nat, { id : Nat; name : Text; category : Text; mrp : Float; b2bRate : Float }>;
    subAccountStore : Map.Map<Nat, { id : Nat; name : Text; phone : Text }>;
    nextTestId : Nat;
    nextSubAccountId : Nat;
    adminSession : ?Text;
  };

  type NewActor = {
    testStore : Map.Map<Nat, { id : Nat; name : Text; category : Text; mrp : Float; b2bRate : Float }>;
    subAccountStore : Map.Map<Nat, { id : Nat; name : Text; phone : Text }>;
    subAccountRates : Map.Map<Text, { subAccountId : Nat; testId : Nat; b2bRate : Float }>;
    nextTestId : Nat;
    nextSubAccountId : Nat;
    adminSession : ?Text;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      subAccountRates = Map.empty<Text, { subAccountId : Nat; testId : Nat; b2bRate : Float }>()
    };
  };
};
