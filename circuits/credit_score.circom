pragma circom 2.1.6;
include "circomlib/poseidon.circom";

template CreditScore(n) {
    signal input leaves[n];
    signal input root;

    signal input walletAgeMonths;
    signal input onTime;
    signal input early;
    signal input late;
    signal input defaults;

    signal output score;

    component h = Poseidon(n);
    for (var i = 0; i < n; i++) {
        h.inputs[i] <== leaves[i];
    }
    h.out === root;

    score <==
        500
        + walletAgeMonths * 2
        + onTime * 10
        + early * 15
        - late * 20
        - defaults * 100;
}

component main = CreditScore(16);
