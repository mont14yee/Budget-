const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

// Imports
code = code.replace(
    /import \{ db \} from '\.\/firebaseConfig';\nimport \{ collection, onSnapshot, doc, setDoc, deleteDoc, query \} from 'firebase\/firestore';\nimport \{ handleFirestoreError, OperationType \} from '\.\/firebaseError';/g,
    "import { useAuth } from './contexts/AuthContext';\nimport { dbService } from './services/supabaseService';\nimport AuthView from './views/AuthView';"
);

// State and User Auth logic
code = code.replace(
    /const \[userProfile, setUserProfileState\] = useState<UserProfile \| null>\(null\);\n    const \[authReady, setAuthReady\] = useState\(false\);/g,
    "const { user, isLoading: authLoading, signOut } = useAuth();\n    const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);\n    const [authReady, setAuthReady] = useState(false);"
);

// Snapshot logic
code = code.replace(
    /let snapshotUnsubscribes: \(\(\) => void\)\[\] = \[\];[\s\S]*?setAuthReady\(true\);\n        \n        return \(\) => \{\n            cleanupSnapshots\(\);\n        \};\n    \}, \[\]\);/g,
    `if (!user) return;
        const loadData = async () => {
            try {
                const inc = await dbService.getIncome(user.id);
                setIncome(inc);
                const exp = await dbService.getExpenses(user.id);
                setExpenses(exp);
                const goals = await dbService.getSavingsGoals(user.id);
                setSavingsGoals(goals);
                const lns = await dbService.getLoans(user.id);
                setLoans(lns);
                const subs = await dbService.getSubscriptions(user.id);
                setSubscriptions(subs);
                const scheds = await dbService.getScheduledTransactions(user.id);
                setScheduledTransactions(scheds);
                const invs = await dbService.getInvestments(user.id);
                setInvestments(invs);
            } catch (err) {
                console.error("Error loading data:", err);
            } finally {
                setAuthReady(true);
            }
        };
        loadData();
    }, [user]);`
);

fs.writeFileSync('App.tsx', code);
