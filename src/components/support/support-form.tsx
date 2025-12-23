import React, { useContext, useState } from "react";
import {
    SafeAreaView,
    View,
    TextInput,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    ActivityIndicator,
} from "react-native";
import { MaterialIcons, AntDesign, FontAwesome } from "@expo/vector-icons";
import SelectDropdown from 'react-native-select-dropdown';
import { colors } from "@/theme";
import { s } from "react-native-size-matters";
import { PatchRequest, PostRequest } from "@/utils/requests";
import { DataContext } from "@/store/GlobalState";
import { toast } from "sonner-native";
import * as ImagePicker from "expo-image-picker";

const cases = [
    "Delivery Delays", "Package Damage", "Payment Issues", "Others"
]



const SupportForm = () => {
    const [category, setCategory] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [attachment, setAttachment] = useState("");
    const [issue, setIssue] = useState("")
    const [loading, setLoading] = useState(false)
    const {state} = useContext(DataContext)
    const [imageLoading, setImageLoading] = useState(false)
    const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
    const [callback, setCallback] = useState(false)
    const [focusedField, setFocusedField] = useState<null | string>(null);

    // Check if all fields are filled
    const isFormValid = category && title && description;

     const pickImage = async (): Promise<void> => {
        setImage(null);
    
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
          base64: false,
        });
    
        if (!result.canceled && result.assets && result.assets.length > 0) {
          setImage(result.assets[0]);
          setCallback((prev) => !prev)          
        }
      };

    // handle submit
    const handleSubmit = async() => {
        setLoading(true)

        const payload = {
            category,
            title,
            description
        }


        const res = await PostRequest("/issues", payload, state?.token)
        const id = res?.data?.data?.id

        // upload attachment
        if(id){
            await handleUpload(id)

            if (res?.status === 200 || res?.status === 201) {
                toast.success(res?.data?.message)
                setTitle("")
                setDescription("")
            }
        }
        setLoading(false)
    }

    const handleUpload = async (id:string) => {

        // Create FormData object for multipart/form-data
        const formData: any = new FormData();
        formData.append("file", {
            uri: image?.uri,
            type: "image/png",
            name: "profile-image.png",
        });

        try {
            const res = await fetch(
                `${process.env.EXPO_PUBLIC_BASE_URL}/issues/${id}/attachment`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${state?.token}`,
                    },
                    body: formData,
                },
            );

            await res.json();

        } catch (error: any) {
            toast.error(error?.response?.data?.message);
        } 
    };

    // 

    return (
        <SafeAreaView style={styles.container}>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Issue Category</Text>
                <SelectDropdown
                    data={cases}
                    onSelect={(selectedItem, index) => {
                        setCategory(selectedItem);
                    }}
                    renderButton={(selectedItem, isOpened) => {

                        return (
                            <View style={[styles.dropdown, focusedField === "category" && {borderColor:'orange', borderWidth:1}]}>
                                    <Text style={styles.dropdownText}>
                                        {selectedItem || 'Select'}
                                    </Text>
                                    <AntDesign name="down" size={16} color="#000" />
                                </View>
                        );
                    }}
                    renderItem={(item, index, isSelected) => {
                        return (
                            <View
                                style={{
                                    ...styles.dropdownItemStyle,
                                    ...(isSelected && { backgroundColor: '#D2D9DF' }),
                                }}>
                                <Text style={styles.dropdownItemTxtStyle}>{item}</Text>
                            </View>
                        );
                    }}

                    showsVerticalScrollIndicator={false}
                    dropdownStyle={styles.dropdownMenuStyle}
                    onFocus={() => setFocusedField("category")}
                    onBlur={() => setFocusedField(null)}
                />

            </View>

            {/* Title */}
            <View style={styles.formGroup}>
                <Text style={styles.label}>Title</Text>
                <TextInput
                    style={[styles.input, focusedField === "title" && { borderColor: "#f97216", borderWidth: 0.5 }]}
                    placeholder="Add a case subject"
                    placeholderTextColor="#B8B8B8"
                    value={title}
                    onChangeText={setTitle}
                    onFocus={() => setFocusedField("title")}
                    onBlur={() => setFocusedField(null)}
                />
            </View>

            {/* Description */}
            <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={[styles.input, styles.textarea, focusedField === "description" && { borderColor: "#f97216", borderWidth: 0.5 }]}
                    placeholder="Enter the details of your request"
                    placeholderTextColor="#B8B8B8"
                    multiline={true}
                    value={description}
                    onChangeText={setDescription}
                    onFocus={() => setFocusedField("description")}
                    onBlur={() => setFocusedField(null)}
                />
            </View>

            {/* Attachment */}
            <View style={styles.formGroup}>
                <Text style={styles.label}>Attachment</Text>
                <TouchableOpacity
                    style={[styles.input, styles.attachment]}
                    onPress={pickImage}
                >
                    <Text style={styles.attachmentText}>
                        {!image ? "Add screenshot or other files" : 
                        <View style={{alignItems:'center', justifyContent:'center', rowGap:5}}>
                            <FontAwesome name="image" size={24} color={colors.mutedForeground} />
                            <Text style={{color:colors.mutedForeground}}>Image Selected</Text>
                        </View>
                        }
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
                style={[
                    styles.submitButton,
                    !isFormValid && styles.submitButtonDisabled,
                ]}
                disabled={!isFormValid}
                onPress={handleSubmit} 
            >
                <Text style={styles.submitButtonText}>Submit</Text>
               {loading && <ActivityIndicator size="small" color={colors.white}/>}
            </TouchableOpacity>
        </SafeAreaView>
    );
};

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        paddingTop: 16,
    },
    formGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: "500",
        color: "#000000",
        marginBottom: 8,
    },
    input: {
        backgroundColor: "#F5F5F5",
        borderRadius: 8,
        height: 48,
        paddingHorizontal: 16,
        fontSize: 14,
        color: "#000000",
        borderWidth: 1,
        borderColor: "#E6E6E6",
    },
    dropdown: {
        backgroundColor: "#F5F5F5",
        borderRadius: 8,
        height: 48,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: "#E6E6E6",
        flexDirection:'row',
        justifyContent:"space-between",
        alignItems:'center'
    },
    dropdownText:{
        fontSize: 14,
        color: "#000000",
    },
    textarea: {
        height: 96, // Double height for multi-line
        textAlignVertical: "top",
    },
    attachment: {
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderStyle: "dashed",
        height: 80,
    },
    attachmentText: {
        color: "#A1A1A1",
    },
    submitButton: {
        backgroundColor: "#FF7800",
        height: 48,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 8,
        flexDirection:'row'
    },
    submitButtonDisabled: {
        backgroundColor: "#FFCC99",
    },
    submitButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
   dropdownMenuStyle: {
           borderRadius: 10,
           marginTop:10
       },
       dropdownItemStyle: {
           flexDirection: 'row',
           paddingHorizontal: 12,
           justifyContent: 'center',
           alignItems: 'center',
           paddingVertical: 15,
           borderBottomWidth: 1,
           borderBottomColor: colors.muted,
       },
       dropdownItemTxtStyle: {
           flex: 1,
           fontSize: s(12),
           color: colors.black,
       },
});

export default SupportForm;
