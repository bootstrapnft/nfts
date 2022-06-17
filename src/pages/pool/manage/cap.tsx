import { useState } from "react";
import Modal from "@/pages/pool/manage/modal";

const ChangeCap = ({ close }: any) => {
    const [cap, setCap] = useState(100);
    return (
        <Modal close={close} title="Edit cap" maxW="max-w-lg">
            <div className="mt-4">
                <div className="mt-4">
                    <dl className="text-center">
                        <dt className="mt-4 text-lg text-purple-second">
                            Change pool supply cap
                        </dt>
                        <dd>
                            <input
                                className="input-second w-2/3 mt-3"
                                value={cap}
                                type="number"
                                min="100"
                                max="1000000000"
                                step="100"
                                onChange={(e) => {
                                    let val = parseInt(e.target.value);
                                    if (val < 100) {
                                        val = 100;
                                    } else {
                                        const v = val % 100;
                                        if (v !== 0) {
                                            val = val - v;
                                        }
                                    }
                                    setCap(val);
                                }}
                            />
                        </dd>
                    </dl>
                </div>
                <div className="flex justify-center gap-x-4 mt-8">
                    <button
                        className="btn-primary bg-purple-primary bg-opacity-50"
                        onClick={close}
                    >
                        Cancel
                    </button>
                    <button className="btn-primary" disabled={true}>
                        Confirm
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ChangeCap;
