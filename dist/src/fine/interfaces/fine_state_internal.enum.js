export var FineStateInternal;
(function (FineStateInternal) {
    FineStateInternal[FineStateInternal["PENDING"] = 0] = "PENDING";
    FineStateInternal[FineStateInternal["PAID"] = 1] = "PAID";
    FineStateInternal[FineStateInternal["APPEALED"] = 2] = "APPEALED";
    FineStateInternal[FineStateInternal["RESOLVED_APPEAL"] = 3] = "RESOLVED_APPEAL";
    FineStateInternal[FineStateInternal["CANCELLED"] = 4] = "CANCELLED";
})(FineStateInternal || (FineStateInternal = {}));
