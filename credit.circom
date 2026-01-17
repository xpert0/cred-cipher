pragma circom 2.1.4;

template CreditScore() {
    signal input ageScore;
    signal input txScore;
    signal input defaultPenalty;

    signal output finalScore;

    finalScore <== ageScore * 2 + txScore * 3 - defaultPenalty;
}

component main = CreditScore();
